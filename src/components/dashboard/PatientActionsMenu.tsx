import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { MoreHorizontal, Eye, Eraser, Trash2, AlertTriangle, Shield } from 'lucide-react';
import { useDeletePatient, useUpdatePatient } from '@/hooks/usePatients';
import { useDeleteTreatmentPlan } from '@/hooks/useTreatmentPlan';
import { useClearDentalChart } from '@/hooks/useDentalChart';
import { useToast } from '@/hooks/use-toast';

interface PatientActionsMenuProps {
  patientId: string;
  patientName: string;
  onActionComplete?: () => void;
}

export function PatientActionsMenu({ patientId, patientName, onActionComplete }: PatientActionsMenuProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const deletePatient = useDeletePatient();
  const updatePatient = useUpdatePatient();
  const deleteTreatmentPlan = useDeleteTreatmentPlan();
  const clearDentalChart = useClearDentalChart();

  const [showClearDataDialog, setShowClearDataDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const handleClearClinicalData = async () => {
    if (confirmText !== 'DELETE') return;
    setIsProcessing(true);
    try {
      await updatePatient.mutateAsync({
        id: patientId,
        ap_relation: null, horizontal_relation: null, vertical_relation: null,
        overbite_mm: null, overjet_mm: null, molar_relation: null, canine_relation: null,
        incisor_relation: null, oral_hygiene: null, lips: null, habits: null,
        tongue_position: null, tongue_size: null, upper_buccal: null, lower_buccal: null,
        upper_labial: null, lower_labial: null, upper_space_available: null,
        upper_space_required: null, lower_space_available: null, lower_space_required: null,
      });
      await deleteTreatmentPlan.mutateAsync(patientId);
      await clearDentalChart.mutateAsync(patientId);
      toast({ title: 'Clinical Data Cleared', description: `Clinical data for ${patientName} has been cleared. Basic info is preserved.` });
      setShowClearDataDialog(false); setConfirmText(''); onActionComplete?.();
    } catch (error) {
      console.error('Error clearing clinical data:', error);
      toast({ title: 'Error', description: 'Failed to clear clinical data.', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeletePatient = async () => {
    if (confirmText !== 'DELETE') return;
    setIsProcessing(true);
    try {
      await deletePatient.mutateAsync(patientId);
      toast({ title: 'Patient Deleted', description: `${patientName} has been permanently removed.` });
      setShowDeleteDialog(false); setConfirmText(''); onActionComplete?.();
    } catch (error) {
      console.error('Error deleting patient:', error);
      toast({ title: 'Error', description: 'Failed to delete patient.', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseDialog = (setter: (val: boolean) => void) => {
    setter(false); setConfirmText('');
  };

  return (
    <>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/patient/${patientId}`); }} className="text-primary hover:text-primary/80">
          <Eye className="mr-1 h-4 w-4" /> View
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={(e) => e.stopPropagation()}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setShowClearDataDialog(true); }} className="text-warning focus:text-warning cursor-pointer">
              <Eraser className="mr-2 h-4 w-4" /> Clear Clinical Data
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setShowDeleteDialog(true); }} className="text-destructive focus:text-destructive cursor-pointer">
              <Trash2 className="mr-2 h-4 w-4" /> Delete Patient
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={showClearDataDialog} onOpenChange={() => handleCloseDialog(setShowClearDataDialog)}>
        <DialogContent className="border-warning/30">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-warning">
              <div className="h-10 w-10 rounded-lg bg-warning/20 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5" />
              </div>
              Clear Clinical Data
            </DialogTitle>
            <DialogDescription className="text-left text-muted-foreground pt-4">
              This will remove all clinical data for <strong className="text-foreground">{patientName}</strong> including:
              <ul className="mt-3 list-inside list-disc space-y-1 text-sm">
                <li>Clinical Relations (Step 2)</li>
                <li>Soft Tissue Assessment (Step 3)</li>
                <li>Dental Chart (Step 4)</li>
                <li>Segment Analysis (Step 5)</li>
                <li>Media & Treatment Plan (Steps 6-7)</li>
              </ul>
              <p className="mt-4 p-3 rounded-md bg-success/10 border border-success/30 text-success text-sm">
                <strong>Basic Info (Name, Age, Chief Complaint)</strong> will be preserved.
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <Label htmlFor="confirm-clear" className="text-sm text-muted-foreground">
              Type <span className="font-mono font-bold text-warning">DELETE</span> to confirm
            </Label>
            <Input id="confirm-clear" value={confirmText} onChange={(e) => setConfirmText(e.target.value.toUpperCase())} placeholder="Type DELETE" className="font-mono text-center text-lg border-warning/30 focus:border-warning" autoComplete="off" />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => handleCloseDialog(setShowClearDataDialog)} disabled={isProcessing}>Cancel</Button>
            <Button onClick={handleClearClinicalData} disabled={isProcessing || confirmText !== 'DELETE'} className="bg-warning text-warning-foreground hover:bg-warning/90">
              {isProcessing ? 'Clearing...' : 'Clear Data'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteDialog} onOpenChange={() => handleCloseDialog(setShowDeleteDialog)}>
        <DialogContent className="border-destructive/30">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <div className="h-10 w-10 rounded-lg bg-destructive/20 flex items-center justify-center">
                <Shield className="h-5 w-5" />
              </div>
              Permanent Deletion
            </DialogTitle>
            <DialogDescription className="text-muted-foreground pt-4">
              <p className="p-3 rounded-md bg-destructive/10 border border-destructive/30 text-destructive text-sm mb-4">
                ⚠️ This action <strong>cannot be undone</strong>. All data will be permanently lost.
              </p>
              This will permanently delete <strong className="text-foreground">{patientName}</strong> and all associated data:
              <ul className="mt-3 list-inside list-disc space-y-1 text-sm">
                <li>Patient profile and basic info</li>
                <li>All clinical assessments</li>
                <li>Dental charts and treatment plans</li>
                <li>All uploaded photos and X-rays</li>
                <li>Session history</li>
              </ul>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <Label htmlFor="confirm-delete" className="text-sm text-muted-foreground">
              Type <span className="font-mono font-bold text-destructive">DELETE</span> to confirm
            </Label>
            <Input id="confirm-delete" value={confirmText} onChange={(e) => setConfirmText(e.target.value.toUpperCase())} placeholder="Type DELETE" className="font-mono text-center text-lg border-destructive/30 focus:border-destructive" autoComplete="off" />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => handleCloseDialog(setShowDeleteDialog)} disabled={isProcessing}>Cancel</Button>
            <Button onClick={handleDeletePatient} disabled={isProcessing || confirmText !== 'DELETE'} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isProcessing ? 'Deleting...' : 'Delete Permanently'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
