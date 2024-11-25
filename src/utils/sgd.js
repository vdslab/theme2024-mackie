import * as d3 from "d3";

self.onmessage = ({ data }) => {
  sgd(data);
};

function sgd({ graph, shortestPath: d }) {
  // In [3]:
  const n = graph.length;
  
  // In [4]:
  const constraints = [];

  let w_min = Infinity;
  let w_max = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < i; j++) {
      const w = 1 / d[i][j] ** 2;
      w_min = Math.min(w, w_min);
      w_max = Math.max(w, w_max);
      constraints.push({ i, j, w });
    }
  }

  // In [5]:
  const num_iter = 15;
  const epsilon = 0.1;

  const eta_max = 1 / w_min;
  const eta_min = epsilon / w_max;

  const lambda = Math.log(eta_min / eta_max) / (num_iter - 1);
  const eta = (t) => eta_max * Math.exp(lambda * t);

  const schedule = Array.from({ length: num_iter }, (_, i) => eta(i));

  // In [6]:
  let positions = Array.from({ length: n }, () => [Math.random(), Math.random()]);

  schedule.forEach((c, index) => {
    d3.shuffle(constraints);

    for (const { i, j, w } of constraints) {
      let wc = w * c;
      if (wc > 1) {
        wc = 1;
      }

      const pq = [positions[i][0] - positions[j][0], positions[i][1] - positions[j][1]];
      // mag は |p-q|
      const mag = Math.sqrt(pq[0] ** 2 + pq[1] ** 2);
      const r = (d[i][j] - mag) / 2;
      const m = [wc * r * pq[0] / mag, wc * r * pq[1] / mag];

      positions[i][0] += m[0];
      positions[i][1] += m[1];
      positions[j][0] -= m[0];
      positions[j][1] -= m[1];
    }

    const progressValue = (index + 1) / schedule.length * 100;
    progressValue < 100 && self.postMessage({ "progress": progressValue });
  });

  self.postMessage({ "progress": 100, "positions": positions });
  return positions;
}

export default {}