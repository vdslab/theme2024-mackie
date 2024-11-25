self.onmessage = ({ data }) => {
  allPairsShortestPaths(data);
};

function dijkstra(graph, start, isUnweighted) {
  const n = graph.length;
  const dist = Array(n).fill(Infinity);
  dist[start] = 0;
  const visited = Array(n).fill(false);

  for (let i = 0; i < n; i++) {
    let u = -1;
    let minDist = Infinity;

    for (let j = 0; j < n; j++) {
      if (!visited[j] && dist[j] < minDist) {
        minDist = dist[j];
        u = j;
      }
    }

    if (u === -1) break; // すべての頂点が訪問済みなら終了

    visited[u] = true;

    // uの隣接頂点を更新
    for (let j = 0; j < n; j++) {
      const weight = isUnweighted ? 1 : graph[u][j]; // 重みなしなら1、重みありなら実際の重み

      if (!visited[j] && graph[u][j] !== 0 && dist[u] + weight < dist[j]) {
        dist[j] = dist[u] + weight;
      }
    }
  }

  return dist;
}

function johnson(graph) {
  const n = graph.length;
  const result = [];

  for (let i = 0; i < n; i++) {
    result.push(dijkstra(graph, i, true));

    const progressValue = (i + 1) / n * 100;
    progressValue < 100 && self.postMessage({ "progress": progressValue });
  }

  self.postMessage({ "progress": 100, "shortestPath": result });
  return result;
}

function floydWarshall(graph) {
  const n = graph.length;

  // 最短経路を格納するための距離行列をコピー
  let dist = [];
  for (let i = 0; i < n; i++) {
    dist[i] = [];
    for (let j = 0; j < n; j++) {
      if (i === j) {
        dist[i][j] = 0;  // 自己ループは0
      } else if (graph[i][j] !== 0 && graph[i][j] !== Infinity) {
        dist[i][j] = 1;  // 重みがあれば1
      } else {
        dist[i][j] = Infinity;  // 直接の辺がない場合はInfinity
      }
    }
  }

  for (let k = 0; k < n; k++) {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (dist[i][j] > dist[i][k] + dist[k][j]) {
          dist[i][j] = dist[i][k] + dist[k][j];
        }
      }
    }

    const progressValue = (k + 1) / n * 100;
    progressValue < 100 && self.postMessage({ "progress": progressValue });
  }

  self.postMessage({ "progress": 100, "shortestPath": dist });
  return dist;
}

// In [2]:
function allPairsShortestPaths(graph) {
  // return johnson(graph);
  return floydWarshall(graph);
}

export default {}
