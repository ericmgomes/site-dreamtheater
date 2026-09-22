type Measurement = () => (() => void) | void;
const measurements = new Set<Measurement>();
let pending = false;

// Share a frame across components: finish every layout read before any DOM write.
export function measureFrame(measure: Measurement) {
  measurements.add(measure);
  if (pending) return;
  pending = true;
  requestAnimationFrame(() => {
    pending = false;
    const batch = [...measurements];
    measurements.clear();
    const mutations = batch.map(read => read());
    mutations.forEach(write => write?.());
  });
}

// Give DOM changes a rendering opportunity before measuring their new geometry.
export function afterLayout(measure: Measurement) {
  requestAnimationFrame(() => measureFrame(measure));
}
