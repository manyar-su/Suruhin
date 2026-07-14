import { Crosshair, Map, Navigation2 } from 'lucide-react';
import { Button } from '../shared/Button';

interface TrackingControlsProps {
  canSelectMeetingPoint: boolean;
  isSelectionMode: boolean;
  onOpenGoogleMaps: () => void;
  onOpenMapbox: () => void;
  onToggleSelectionMode: () => void;
}

export function TrackingControls({
  canSelectMeetingPoint,
  isSelectionMode,
  onOpenGoogleMaps,
  onOpenMapbox,
  onToggleSelectionMode,
}: TrackingControlsProps) {
  return (
    <div className="flex flex-col gap-3 rounded-[28px] border border-slate-100 bg-white p-4 shadow-sm sm:flex-row sm:flex-wrap">
      {canSelectMeetingPoint && (
        <Button
          variant={isSelectionMode ? 'secondary' : 'outline'}
          onClick={onToggleSelectionMode}
          className="font-bold"
        >
          <Crosshair size={15} className="mr-2" />
          {isSelectionMode ? 'Selesai Pilih Titik Temu' : 'Pilih Titik Temu di Peta'}
        </Button>
      )}

      <Button variant="outline" onClick={onOpenMapbox} className="font-bold">
        <Map size={15} className="mr-2" />
        Buka di Mapbox
      </Button>

      <Button variant="outline" onClick={onOpenGoogleMaps} className="font-bold">
        <Navigation2 size={15} className="mr-2" />
        Buka di Google Maps
      </Button>
    </div>
  );
}
