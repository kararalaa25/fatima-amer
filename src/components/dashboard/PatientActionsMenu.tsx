import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MoreHorizontal, Eye, Eraser, Trash2, AlertTriangle } from 'lucide-react';
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

  const handleClearClinicalData = async () => {
    setIsProcessing(true);
    try {
      // Clear clinical data (Steps 2-6) but keep basic info
      await updatePatient.mutateAsync({
        id: patientId,
        // Clear Clinical Relations
        ap_relation: null,
        horizontal_relation: null,
        vertical_relation: null,
        overbite_mm: null,
        overjet_mm: null,
        molar_relation: null,
        canine_relation: null,
        incisor_relation: null,
        oral_hygiene: null,
        // Clear Soft Tissue
        lips: null,
        habits: null,
        tongue_position: null,
        tongue_size: null,
        // Clear Segment Analysis
        upper_buccal: null,
        lower_buccal: null,
        upper_labial: null,
        lower_labial: null,
        upper_space_available: null,
        upper_space_required: null,
        lower_space_available: null,
        lower_space_required: null,
      });

      // Delete treatment plan
      await deleteTreatmentPlan.mutateAsync(patientId);

      // Clear dental chart
      await clearDentalChart.mutateAsync(patientId);

      toast({
        title: 'Clinical Data Cleared',
        description: `Clinical data for ${patientName} has been cleared. Basic info is preserved.`,
      });
      
      setShowClearDataDialog(false);
      onActionComplete?.();
    } catch (error) {
      console.error('Error clearing clinical data:', error);
      toast({
        title: 'Error',
        description: 'Failed to clear clinical data.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeletePatient = async () => {
    setIsProcessing(true);
    try {
      await deletePatient.mutateAsync(patientId);
      
      toast({
        title: 'Patient Deleted',
        description: `${patientName} has been permanently removed.`,
      });
      
      setShowDeleteDialog(false);
      onActionComplete?.();
    } catch (error) {
      console.error('Error deleting patient:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete patient.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/patient/${patientId}`);
          }}
        >
          <Eye className="mr-1 h-4 w-4" />
          View
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                setShowClearDataDialog(true);
              }}
              className="text-warning"
            >
              <Eraser className="mr-2 h-4 w-4" />
              Clear Clinical Data
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteDialog(true);
              }}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Patient
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Clear Clinical Data Confirmation */}
      <AlertDialog open={showClearDataDialog} onOpenChange={setShowClearDataDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-warning">
              <AlertTriangle className="h-5 w-5" />
              Clear Clinical Data
            </AlertDialogTitle>
            <AlertDialogDescription className="text-left">
              This will remove all clinical data for <strong>{patientName}</strong> including:
              <ul className="mt-2 list-inside list-disc space-y-1">
                <li>Clinical Relations (Step 2)</li>
                <li>Soft Tissue Assessment (Step 3)</li>
                <li>Dental Chart (Step 4)</li>
                <li>Segment Analysis (Step 5)</li>
                <li>Treatment Plan (Step 6)</li>
              </ul>
              <p className="mt-3">
                <strong>Basic Info (Name, Age, Chief Complaint)</strong> will be preserved.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearClinicalData}
              disabled={isProcessing}
              className="bg-warning text-warning-foreground hover:bg-warning/90"
            >
              {isProcessing ? 'Clearing...' : 'Clear Data'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Patient Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Delete Patient
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action <strong>cannot be undone</strong>. This will permanently delete{' '}
              <strong>{patientName}</strong> and all associated data including photos, sessions,
              dental charts, and treatment plans.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePatient}
              disabled={isProcessing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isProcessing ? 'Deleting...' : 'Delete Permanently'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
