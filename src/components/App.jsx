import { useState, useEffect, useRef } from "react";
import { Box, Button, Container, Paper, Select, MenuItem, Typography } from "@mui/material";
import { ShowChart } from "@mui/icons-material";

import LinearProgressWithLabel from "./LinearProgressWithLabel.jsx";
import Graph from "./Graph.jsx";
import ShortestPathWorker from "../utils/shortestPath?worker";
import SgdWorker from "../utils/sgd?worker";
import computeStress from "../utils/computeStress.js";

export default function App() {
  const [selectedGraphName, setSelectedGraphName] = useState("qh882");
  const [selectedGraph, setSelectedGraph] = useState(null);
  const [shortestPathProgress, setShortestPathProgress] = useState(0);
  const [positionsProgress, setPositionsProgress] = useState(0);
  const [shortestPath, setShortestPath] = useState(null);
  const [positions, setPositions] = useState(null);
  const shortestPathWorkerRef = useRef();
  const positionsWorkerRef = useRef();

  const stress = positions ? computeStress(selectedGraph, positions, shortestPath) : null;

  const handleChange = (e) => {
    setSelectedGraphName(e.target.value);
  };

  const handleClick = async () => {
    // 実行中の処理があれば中止
    shortestPathWorkerRef.current?.terminate();
    positionsWorkerRef.current?.terminate();

    // グラフデータの読み込み
    const response = await import(`../data/${selectedGraphName}_adjacency.json`);
    const graphData = response.default;
    setSelectedGraph(graphData);

    // 処理を初期化
    shortestPathWorkerRef.current = new ShortestPathWorker();
    positionsWorkerRef.current = new SgdWorker();
    shortestPathWorkerRef.current.onmessage = (e) => handleShortestPathWorkerMessage(e, graphData);
    positionsWorkerRef.current.onmessage = handlePositionsWorkerMessage;
    setShortestPathProgress(0);
    setPositionsProgress(0);
    setShortestPath(null);
    setPositions(null);

    shortestPathWorkerRef.current.postMessage(graphData);
  };

  const handleShortestPathWorkerMessage = ({ data: { progress, shortestPath } }, graph) => {
    progress && setShortestPathProgress(progress);
    if (shortestPath) {
      setShortestPath(shortestPath);
      positionsWorkerRef.current.postMessage({ graph, shortestPath });
    }
  };

  const handlePositionsWorkerMessage = ({ data: { progress, positions } }) => {
    progress && setPositionsProgress(progress);
    positions && setPositions(positions);
  };

  useEffect(() => {
    return () => {
      shortestPathWorkerRef.current?.terminate();
      positionsWorkerRef.current?.terminate();
    };
  }, []);

  return (
    <Container maxWidth="md">
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>グラフデータの選択</Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <Select
              value={selectedGraphName}
              onChange={handleChange}
              sx={{ minWidth: 240 }}
              size="small"
            >
              <MenuItem value="qh882">qh882</MenuItem>
              <MenuItem value="lesmis">lesmis</MenuItem>
              <MenuItem value="1138_bus">1138_bus</MenuItem>
            </Select>
            <Button variant="contained" onClick={handleClick} endIcon={<ShowChart />}>
              グラフを描画
            </Button>
          </Box>
        </Paper>

        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>全頂点対最短経路の計算</Typography>
          <LinearProgressWithLabel value={shortestPathProgress} />
        </Paper>

        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>グラフの描画</Typography>
          <Box sx={{ width: "100%", height: 400, border: "1px solid #ccc", marginBottom: 2 }}>
            {positions && (
              <Graph graph={selectedGraph} positions={positions} />
            )}
          </Box>
          <Typography gutterBottom>
            ストレス値：{stress === null ? "計算中･･･" : Math.floor(stress)}
          </Typography>
          <LinearProgressWithLabel value={positionsProgress} />
        </Paper>
      </Box>
    </Container>
  );
}
