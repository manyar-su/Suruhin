import mapboxgl from 'mapbox-gl';

/**
 * Builds a custom HTML marker for the talent position.
 */
export function createTalentMarker(label = 'Talent') {
  const element = document.createElement('div');
  element.className = 'suruhin-talent-marker';
  element.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;gap:6px;">
      <div style="padding:4px 8px;border-radius:999px;background:#082B5C;color:#fff;font-size:10px;font-weight:800;box-shadow:0 8px 20px rgba(8,43,92,.18);white-space:nowrap;">
        ${label}
      </div>
      <div style="width:18px;height:18px;border-radius:999px;background:#082B5C;border:3px solid #fff;box-shadow:0 8px 20px rgba(8,43,92,.24);position:relative;">
        <span style="position:absolute;inset:-7px;border-radius:999px;border:2px solid rgba(8,43,92,.24);"></span>
      </div>
    </div>
  `;

  return new mapboxgl.Marker({
    element,
    anchor: 'bottom',
  });
}
