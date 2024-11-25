export default function computeStress(graph, positions, d) {
  const n = graph.length;
  
  // In [9]:
  let stress = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < i; j++) {
      const pq = [positions[i][0] - positions[j][0], positions[i][1] - positions[j][1]];
      const mag = Math.sqrt(pq[0] ** 2 + pq[1] ** 2);

      stress += (1 / d[i][j] ** 2) * (d[i][j] - mag) ** 2;
    }
  }

  return stress;
}
