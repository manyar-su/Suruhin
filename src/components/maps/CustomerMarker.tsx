import mapboxgl from 'mapbox-gl';

/**
 * Builds a custom HTML marker for the customer or meeting origin.
 */
export function createCustomerMarker(label = 'Pengguna') {
  const element = document.createElement('div');
  element.className = 'suruhin-customer-marker';
  element.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;gap:6px;">
      <div style="padding:4px 8px;border-radius:999px;background:#FF6500;color:#fff;font-size:10px;font-weight:800;box-shadow:0 8px 20px rgba(255,101,0,.22);white-space:nowrap;">
        ${label}
      </div>
      <div style="width:18px;height:18px;border-radius:999px;background:#FF6500;border:3px solid #fff;box-shadow:0 8px 20px rgba(255,101,0,.24);position:relative;">
        <span style="position:absolute;inset:-7px;border-radius:999px;border:2px solid rgba(255,101,0,.18);"></span>
      </div>
    </div>
  `;

  return new mapboxgl.Marker({
    element,
    anchor: 'bottom',
  });
}
