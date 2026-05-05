import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { SiteHeader } from '@/components/SiteHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { CATEGORIES } from '@/lib/categories';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

const BUCKET = 'portfolio-media';

export default function AdminCaseEditor() {
  const { id } = useParams<{ id: string }>();
  const isNew = !id;
  const navigate = useNavigate();
  const { user, isAuthenticated, loading } = useAuth();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string>('crown_bridge');
  const [description, setDescription] = useState('');
  const [toolsInput, setToolsInput] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [beforeImage, setBeforeImage] = useState('');
  const [afterImage, setAfterImage] = useState('');
  const [stlFileUrl, setStlFileUrl] = useState('');
  const [exocadViewerUrl, setExocadViewerUrl] = useState('');
  const [published, setPublished] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) navigate('/auth');
  }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    if (!id) return;
    supabase.from('cases').select('*').eq('id', id).maybeSingle().then(({ data }) => {
      if (!data) return;
      setTitle(data.title);
      setCategory(data.category);
      setDescription(data.description ?? '');
      setToolsInput((data.tools_used ?? []).join(', '));
      setCoverImage(data.cover_image ?? '');
      setImages(data.images ?? []);
      setBeforeImage(data.before_image ?? '');
      setAfterImage(data.after_image ?? '');
      setStlFileUrl(data.stl_file_url ?? '');
      setExocadViewerUrl((data as any).exocad_viewer_url ?? '');
      setPublished(data.published);
    });
  }, [id]);

  const upload = async (file: File): Promise<string | null> => {
    const ext = file.name.split('.').pop();
    const path = `${user?.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file);
    if (error) { toast.error(error.message); return null; }
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return data.publicUrl;
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await upload(file);
    if (url) setter(url);
    e.target.value = '';
  };

  const handleMultiFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const urls: string[] = [];
    for (const f of files) {
      const url = await upload(f);
      if (url) urls.push(url);
    }
    setImages((prev) => [...prev, ...urls]);
    e.target.value = '';
  };

  const save = async () => {
    if (!title.trim()) { toast.error('Title required'); return; }
    setSaving(true);
    const tools = toolsInput.split(',').map((s) => s.trim()).filter(Boolean);
    const payload = {
      title, category, description: description || null,
      tools_used: tools, cover_image: coverImage || null,
      images, before_image: beforeImage || null, after_image: afterImage || null,
      stl_file_url: stlFileUrl || null, exocad_viewer_url: exocadViewerUrl || null, published, created_by: user?.id,
    };
    const { error } = isNew
      ? await supabase.from('cases').insert(payload)
      : await supabase.from('cases').update(payload).eq('id', id!);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(isNew ? 'Case created' : 'Case updated');
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto max-w-4xl px-4 py-12">
        <Link to="/admin" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to admin
        </Link>
        <h1 className="mt-4 font-display text-3xl font-semibold">{isNew ? 'New Case' : 'Edit Case'}</h1>

        <Card className="mt-8 space-y-6 p-6">
          <div>
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Full mouth zirconia rehabilitation" />
          </div>

          <div>
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the case, workflow and clinical considerations" />
          </div>

          <div>
            <Label>Digital tools (comma-separated)</Label>
            <Input value={toolsInput} onChange={(e) => setToolsInput(e.target.value)} placeholder="Exocad, 3Shape, 3D printing" />
          </div>

          <ImageField label="Cover image" url={coverImage} onUpload={(e) => handleFile(e, setCoverImage)} onClear={() => setCoverImage('')} />

          <div>
            <Label>Gallery images</Label>
            <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {images.map((url, i) => (
                <div key={i} className="group relative aspect-square overflow-hidden rounded-lg border border-border">
                  <img src={url} alt="" className="h-full w-full object-cover" />
                  <button type="button" onClick={() => setImages((p) => p.filter((_, j) => j !== i))} className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary">
                <Upload className="h-5 w-5" />
                <span className="text-xs">Add</span>
                <input type="file" multiple accept="image/*" className="hidden" onChange={handleMultiFiles} />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <ImageField label="Before image" url={beforeImage} onUpload={(e) => handleFile(e, setBeforeImage)} onClear={() => setBeforeImage('')} />
            <ImageField label="After image" url={afterImage} onUpload={(e) => handleFile(e, setAfterImage)} onClear={() => setAfterImage('')} />
          </div>

          <div>
            <Label>STL file (3D mesh)</Label>
            {stlFileUrl ? (
              <div className="mt-2 flex items-center justify-between rounded-lg border border-border p-3">
                <span className="truncate text-sm">{stlFileUrl.split('/').pop()}</span>
                <Button variant="ghost" size="sm" onClick={() => setStlFileUrl('')}>Remove</Button>
              </div>
            ) : (
              <label className="mt-2 flex cursor-pointer items-center gap-2 rounded-lg border-2 border-dashed border-border p-4 text-sm text-muted-foreground hover:border-primary hover:text-primary">
                <Upload className="h-4 w-4" />
                Upload .stl file
                <input type="file" accept=".stl" className="hidden" onChange={(e) => handleFile(e, setStlFileUrl)} />
              </label>
            )}
          </div>

          <div>
            <Label>Exocad Viewer link (URL)</Label>
            <Input value={exocadViewerUrl} onChange={(e) => setExocadViewerUrl(e.target.value)} placeholder="https://viewer.exocad.com/..." />
          </div>

          <div className="flex items-center gap-3">
            <input id="pub" type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="h-4 w-4" />
            <Label htmlFor="pub" className="cursor-pointer">Published (visible on site)</Label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => navigate('/admin')}>Cancel</Button>
            <Button onClick={save} disabled={saving} className="gradient-hero">
              {saving ? 'Saving…' : isNew ? 'Create case' : 'Save changes'}
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
}

function ImageField({ label, url, onUpload, onClear }: { label: string; url: string; onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void; onClear: () => void; }) {
  return (
    <div>
      <Label>{label}</Label>
      {url ? (
        <div className="relative mt-2 overflow-hidden rounded-lg border border-border">
          <img src={url} alt="" className="aspect-video w-full object-cover" />
          <Button variant="secondary" size="sm" onClick={onClear} className="absolute right-2 top-2">Remove</Button>
        </div>
      ) : (
        <label className="mt-2 flex aspect-video cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary">
          <Upload className="h-5 w-5" />
          <span className="text-sm">Upload image</span>
          <input type="file" accept="image/*" className="hidden" onChange={onUpload} />
        </label>
      )}
    </div>
  );
}
