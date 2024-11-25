import { useEffect, useRef } from "react";
import * as d3 from "d3";

export default function Graph({ graph, positions }) {
  const svgRef = useRef();

  useEffect(() => {
    const width = 800;
    const height = 600;
    const marginTop = 20;
    const marginRight = 40;
    const marginBottom = 30;
    const marginLeft = 40;

    const xScale = d3.scaleLinear()
      .domain([d3.min(positions, d => d[0]), d3.max(positions, d => d[0])])
      .nice()
      .range([marginLeft, width - marginRight]);

    const yScale = d3.scaleLinear()
      .domain([d3.min(positions, d => d[0]), d3.max(positions, d => d[0])])
      .nice()
      .range([height - marginBottom, marginTop]);

    const svg = d3.select(svgRef.current)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "width: 100%; height: 100%;");

    let lines = [];
    for (let i = 0; i < graph.length; i++) {
      for (let j = 0; j < i; j++) {
        if (graph[i][j] !== 0) {
          lines.push([positions[i], positions[j]]);
        }
      }
    }

    svg.selectAll("line")
      .data(lines)
      .enter()
      .append("line")
      .attr("x1", d => xScale(d[0][0]))
      .attr("y1", d => yScale(d[0][1]))
      .attr("x2", d => xScale(d[1][0]))
      .attr("y2", d => yScale(d[1][1]))
      .attr("stroke", "black")
      .attr("stroke-width", 1)
      .attr("opacity", 0.5);

    svg.append("g")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .style("user-select", "none")
      .call(d3.axisBottom(xScale));

    svg.append("g")
      .attr("transform", `translate(${marginLeft},0)`)
      .style("user-select", "none")
      .call(d3.axisLeft(yScale));
  }, []);

  return (
    <svg ref={svgRef}></svg>
  );
}