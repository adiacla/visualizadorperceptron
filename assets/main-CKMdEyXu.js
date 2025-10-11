const CONFIG = {
  weightUrl: "./exports/sample_mlp_weights.json",
  maxConnectionsPerNeuron: 20,
  layerSpacing: 5.5,
  inputSpacing: 0.32,
  hiddenSpacing: 0.9,
};

document.addEventListener("DOMContentLoaded", () => {
  initApp().catch((error) => {
    console.error(error);
    displayError("Unable to initialise the visualisation. See console for details.");
  });
});

async function initApp() {
  setupInfoModal();

  const definition = await loadNetworkDefinition(CONFIG.weightUrl);
  if (!definition?.network) {
    throw new Error("Invalid network definition.");
  }

  const mlp = new MLPNetwork(definition.network);
  const drawingGrid = new DrawingGrid(document.getElementById("gridContainer"), 28, 28);
  const predictionChart = new PredictionChart(document.getElementById("predictionChart"));
  const visualizer = new NetworkVisualizer(mlp, {
    layerSpacing: CONFIG.layerSpacing,
    maxConnectionsPerNeuron: CONFIG.maxConnectionsPerNeuron,
    inputSpacing: CONFIG.inputSpacing,
    hiddenSpacing: CONFIG.hiddenSpacing,
  });

  const resetBtn = document.getElementById("resetBtn");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      drawingGrid.clear();
      updateNetwork();
    });
  }

  function updateNetwork() {
    const rawInput = drawingGrid.getPixels();
    const forward = mlp.forward(rawInput);
    const actualActivations = forward.activations;
    const displayActivations = [rawInput, ...actualActivations.slice(1)];
    visualizer.update(displayActivations, actualActivations);

    const logitsTyped =
      forward.preActivations.length > 0
        ? forward.preActivations[forward.preActivations.length - 1]
        : new Float32Array(0);
    const probabilities = softmax(Array.from(logitsTyped));
    predictionChart.update(probabilities);
  }

  drawingGrid.setChangeHandler(() => updateNetwork());
  updateNetwork();
}

function setupInfoModal() {
  const infoButton = document.getElementById("infoButton");
  const infoModal = document.getElementById("infoModal");
  const closeButton = document.getElementById("closeInfoModal");
  if (!infoModal) return;

  const showModal = () => infoModal.classList.add("visible");
  const hideModal = () => infoModal.classList.remove("visible");

  infoButton?.addEventListener("click", showModal);
  closeButton?.addEventListener("click", hideModal);
  infoModal.addEventListener("click", (event) => {
    if (event.target === infoModal) {
      hideModal();
    }
  });
}

async function loadNetworkDefinition(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to load network weights (${response.status})`);
  }
  return response.json();
}

function displayError(message) {
  const chart = document.getElementById("predictionChart");
  if (chart) {
    chart.innerHTML = `<p class="error-text">${message}</p>`;
  }
}

class DrawingGrid {
  constructor(container, rows, cols) {
    if (!container) {
      throw new Error("Grid container not found.");
    }
    this.container = container;
    this.rows = rows;
    this.cols = cols;
    this.values = new Float32Array(rows * cols);
    this.cells = [];
    this.isDrawing = false;
    this.activeMode = "draw";
    this.onChange = null;
    this.pendingChange = false;
    this.buildGrid();
  }

  buildGrid() {
    this.gridElement = document.createElement("div");
    this.gridElement.className = "grid";
    this.gridElement.style.gridTemplateColumns = `repeat(${this.cols}, 1fr)`;
    this.gridElement.style.gridTemplateRows = `repeat(${this.rows}, 1fr)`;

    for (let i = 0; i < this.values.length; i += 1) {
      const cell = document.createElement("div");
      cell.className = "grid-cell";
      cell.dataset.index = String(i);
      this.gridElement.appendChild(cell);
      this.cells.push(cell);
    }

    this.container.innerHTML = "";
    const title = document.createElement("div");
    title.className = "grid-title";
    title.textContent = "Draw a Digit";
    this.container.appendChild(title);
    this.container.appendChild(this.gridElement);

    this.gridElement.addEventListener("pointerdown", (event) => this.handlePointerDown(event));
    this.gridElement.addEventListener("pointermove", (event) => this.handlePointerMove(event));
    window.addEventListener("pointerup", () => this.handlePointerUp());
    this.gridElement.addEventListener("contextmenu", (event) => event.preventDefault());
  }

  setChangeHandler(handler) {
    this.onChange = handler;
  }

  handlePointerDown(event) {
    event.preventDefault();
    const isErase = event.button === 2 || event.buttons === 2;
    this.activeMode = isErase ? "erase" : "draw";
    this.isDrawing = true;
    this.applyPointer(event);
  }

  handlePointerMove(event) {
    if (!this.isDrawing) return;
    this.applyPointer(event);
  }

  handlePointerUp() {
    this.isDrawing = false;
  }

  applyPointer(event) {
    const element = document.elementFromPoint(event.clientX, event.clientY);
    if (!element) return;
    const cell = element.closest("[data-index]");
    if (!cell) return;
    const index = Number(cell.dataset.index);
    if (Number.isNaN(index)) return;
    this.paintCell(index, this.activeMode === "erase");
  }

  paintCell(index, erase = false) {
    const delta = erase ? -0.45 : 0.55;
    const nextValue = Math.min(1, Math.max(0, this.values[index] + delta));
    if (nextValue === this.values[index]) return;
    this.values[index] = nextValue;
    this.updateCellVisual(index);
    this.scheduleChange();
  }

  updateCellVisual(index) {
    const cell = this.cells[index];
    if (!cell) return;
    const value = this.values[index];
    if (value <= 0) {
      cell.style.background = "rgba(255, 255, 255, 0.05)";
      cell.classList.remove("active");
      return;
    }
    const hue = 180 - value * 70;
    const saturation = 70 + value * 25;
    const lightness = 25 + value * 40;
    cell.style.background = `hsl(${hue.toFixed(0)}, ${saturation.toFixed(0)}%, ${lightness.toFixed(0)}%)`;
    cell.classList.add("active");
  }

  scheduleChange() {
    if (this.pendingChange) return;
    this.pendingChange = true;
    requestAnimationFrame(() => {
      this.pendingChange = false;
      if (typeof this.onChange === "function") {
        this.onChange();
      }
    });
  }

  getPixels() {
    return Float32Array.from(this.values);
  }

  clear() {
    this.values.fill(0);
    for (let i = 0; i < this.cells.length; i += 1) {
      this.updateCellVisual(i);
    }
    if (typeof this.onChange === "function") {
      this.onChange();
    }
  }
}

class MLPNetwork {
  constructor(definition) {
    if (!definition.layers?.length) {
      throw new Error("Network definition must contain layers.");
    }
    this.normalization = definition.normalization ?? { mean: 0, std: 1 };
    this.architecture = Array.isArray(definition.architecture)
      ? definition.architecture.slice()
      : this.computeArchitecture(definition.layers);
    this.layers = definition.layers.map((layer, index) => ({
      name: layer.name ?? `dense_${index}`,
      activation: layer.activation ?? "relu",
      weights: layer.weights.map((row) => Float32Array.from(row)),
      biases: Float32Array.from(layer.biases),
    }));
  }

  computeArchitecture(layers) {
    if (!layers.length) return [];
    const architecture = [];
    const firstLayer = layers[0];
    architecture.push(firstLayer.weights[0]?.length ?? 0);
    for (const layer of layers) {
      architecture.push(layer.biases.length);
    }
    return architecture;
  }

  forward(pixels) {
    const { mean, std } = this.normalization;
    const input = new Float32Array(pixels.length);
    for (let i = 0; i < pixels.length; i += 1) {
      input[i] = (pixels[i] - mean) / std;
    }

    const activations = [input];
    const preActivations = [];
    let current = input;

    for (const layer of this.layers) {
      const outSize = layer.biases.length;
      const linear = new Float32Array(outSize);

      for (let neuron = 0; neuron < outSize; neuron += 1) {
        let sum = layer.biases[neuron];
        const weights = layer.weights[neuron];
        for (let source = 0; source < weights.length; source += 1) {
          sum += weights[source] * current[source];
        }
        linear[neuron] = sum;
      }

      preActivations.push(linear);
      let activated;
      if (layer.activation === "relu") {
        activated = new Float32Array(outSize);
        for (let i = 0; i < outSize; i += 1) {
          activated[i] = linear[i] > 0 ? linear[i] : 0;
        }
      } else {
        activated = linear.slice();
      }
      activations.push(activated);
      current = activated;
    }

    return {
      normalizedInput: activations[0],
      activations,
      preActivations,
    };
  }
}

class PredictionChart {
  constructor(container) {
    this.container = container;
    this.rows = [];
    if (!this.container) {
      throw new Error("Prediction chart container not found.");
    }
    this.build();
  }

  build() {
    this.container.innerHTML = "";
    const title = document.createElement("h3");
    title.textContent = "Digit Probabilities";
    this.container.appendChild(title);

    this.chartElement = document.createElement("div");
    this.chartElement.className = "prediction-chart";
    this.container.appendChild(this.chartElement);

    for (let digit = 0; digit < 10; digit += 1) {
      const row = document.createElement("div");
      row.className = "prediction-bar-container";

      const label = document.createElement("span");
      label.className = "prediction-label";
      label.textContent = String(digit);

      const track = document.createElement("div");
      track.className = "prediction-bar-track";

      const bar = document.createElement("div");
      bar.className = "prediction-bar";
      track.appendChild(bar);

      const value = document.createElement("span");
      value.className = "prediction-percentage";
      value.textContent = "0.0%";

      row.appendChild(label);
      row.appendChild(track);
      row.appendChild(value);
      this.chartElement.appendChild(row);
      this.rows.push({ bar, value });
    }
  }

  update(probabilities) {
    if (!probabilities.length) return;
    const maxProb = Math.max(...probabilities);
    probabilities.forEach((prob, index) => {
      const clamped = Math.max(0, Math.min(1, prob));
      const entry = this.rows[index];
      if (!entry) return;
      entry.bar.style.width = `${(clamped * 100).toFixed(1)}%`;
      entry.value.textContent = `${(clamped * 100).toFixed(1)}%`;
      if (clamped === maxProb) {
        entry.bar.classList.add("highest");
      } else {
        entry.bar.classList.remove("highest");
      }
    });
  }
}

class NetworkVisualizer {
  constructor(mlp, options) {
    this.mlp = mlp;
    this.options = Object.assign(
      {
        layerSpacing: 5.5,
        nodeRadius: 0.26,
        maxConnectionsPerNeuron: 16,
        inputSpacing: 0.32,
        hiddenSpacing: 0.9,
      },
      options || {},
    );
    this.layerMeshes = [];
    this.connectionGroups = [];
    this.tempObject = new THREE.Object3D();
    this.tempColor = new THREE.Color();
    this.initThreeScene();
    this.buildLayers();
    this.buildConnections();
    this.animate();
  }

  initThreeScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x05080f);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 200);
    this.camera.position.set(14, 10, 24);

    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.minDistance = 8;
    this.controls.maxDistance = 52;
    this.controls.target.set(0, 6, 0);

    const ambient = new THREE.AmbientLight(0x8fa9ff, 0.65);
    this.scene.add(ambient);
    const directional = new THREE.DirectionalLight(0xffffff, 0.75);
    directional.position.set(12, 18, 18);
    this.scene.add(directional);

    const rimLight = new THREE.DirectionalLight(0x4f8dfc, 0.4);
    rimLight.position.set(-18, 10, -16);
    this.scene.add(rimLight);

    window.addEventListener("resize", () => this.handleResize());
  }

  buildLayers() {
    const geometry = new THREE.SphereGeometry(this.options.nodeRadius, 12, 12);
    const material = new THREE.MeshPhongMaterial({
      color: 0x111a2e,
      shininess: 35,
      specular: 0x1c2d4f,
      transparent: true,
      opacity: 0.95,
    });
    material.vertexColors = true;

    const layerCount = this.mlp.architecture.length;
    const totalWidth = (layerCount - 1) * this.options.layerSpacing;
    const startX = -totalWidth / 2;

    this.mlp.architecture.forEach((neuronCount, layerIndex) => {
      const mesh = new THREE.InstancedMesh(geometry, material.clone(), neuronCount);
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(neuronCount * 3), 3);
      mesh.instanceColor.setUsage(THREE.DynamicDrawUsage);

      const layerX = startX + layerIndex * this.options.layerSpacing;
      const positions = this.computeLayerPositions(layerIndex, neuronCount, layerX);

      positions.forEach((position, instanceIndex) => {
        this.tempObject.position.copy(position);
        this.tempObject.updateMatrix();
        mesh.setMatrixAt(instanceIndex, this.tempObject.matrix);
        const baseColor = this.tempColor.setRGB(0.08, 0.1, 0.18);
        mesh.setColorAt(instanceIndex, baseColor);
      });

      mesh.instanceMatrix.needsUpdate = true;
      mesh.instanceColor.needsUpdate = true;
      this.scene.add(mesh);
      this.layerMeshes.push({ mesh, positions });
    });
  }

  computeLayerPositions(layerIndex, neuronCount, layerX) {
    const positions = [];
    if (layerIndex === 0) {
      const spacing = this.options.inputSpacing;
      let rows;
      let cols;
      if (neuronCount === 28 * 28) {
        rows = 28;
        cols = 28;
      } else {
        cols = Math.ceil(Math.sqrt(neuronCount));
        rows = Math.ceil(neuronCount / cols);
      }
      const height = (rows - 1) * spacing;
      const width = (cols - 1) * spacing;
      let filled = 0;
      for (let row = 0; row < rows && filled < neuronCount; row += 1) {
        for (let col = 0; col < cols && filled < neuronCount; col += 1) {
          const y = height / 2 - row * spacing;
          const z = -width / 2 + col * spacing;
          positions.push(new THREE.Vector3(layerX, y, z));
          filled += 1;
        }
      }
    } else {
      const spacing = this.options.hiddenSpacing;
      const cols = Math.max(1, Math.ceil(Math.sqrt(neuronCount)));
      const rows = Math.ceil(neuronCount / cols);
      const height = (rows - 1) * spacing;
      const width = (cols - 1) * spacing;
      for (let index = 0; index < neuronCount; index += 1) {
        const row = Math.floor(index / cols);
        const col = index % cols;
        const y = height / 2 - row * spacing;
        const z = -width / 2 + col * spacing;
        positions.push(new THREE.Vector3(layerX, y, z));
      }
    }
    return positions;
  }

  buildConnections() {
    const geometry = new THREE.CylinderGeometry(0.025, 0.025, 1, 6, 1, true);
    const material = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
      vertexColors: true,
    });

    this.mlp.layers.forEach((layer, layerIndex) => {
      const { selected, maxAbsWeight } = this.findImportantConnections(layer);
      if (!selected.length) return;

      const mesh = new THREE.InstancedMesh(geometry, material.clone(), selected.length);
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(selected.length * 3), 3);
      mesh.instanceColor.setUsage(THREE.DynamicDrawUsage);

      selected.forEach((connection, instanceIndex) => {
        const sourcePosition = this.layerMeshes[layerIndex].positions[connection.sourceIndex];
        const targetPosition = this.layerMeshes[layerIndex + 1].positions[connection.targetIndex];
        const direction = targetPosition.clone().sub(sourcePosition);
        const length = direction.length();
        const midpoint = sourcePosition.clone().addScaledVector(direction, 0.5);

        this.tempObject.position.copy(midpoint);
        const quaternion = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          direction.clone().normalize(),
        );
        this.tempObject.scale.set(1, length, 1);
        this.tempObject.quaternion.copy(quaternion);
        this.tempObject.updateMatrix();
        mesh.setMatrixAt(instanceIndex, this.tempObject.matrix);
        mesh.setColorAt(instanceIndex, this.tempColor.setRGB(0.1, 0.12, 0.18));
      });

      mesh.instanceMatrix.needsUpdate = true;
      mesh.instanceColor.needsUpdate = true;
      this.scene.add(mesh);
      this.connectionGroups.push({
        mesh,
        connections: selected,
        sourceLayer: layerIndex,
        maxAbsWeight,
      });
    });
  }

  findImportantConnections(layer) {
    const limit = this.options.maxConnectionsPerNeuron;
    const selected = [];
    let maxAbsWeight = 0;
    for (let target = 0; target < layer.weights.length; target += 1) {
      const row = layer.weights[target];
      const candidates = [];
      for (let source = 0; source < row.length; source += 1) {
        const weight = row[source];
        if (!Number.isFinite(weight)) continue;
        const magnitude = Math.abs(weight);
        candidates.push({ sourceIndex: source, targetIndex: target, weight, magnitude });
        if (magnitude > maxAbsWeight) maxAbsWeight = magnitude;
      }
      candidates.sort((a, b) => b.magnitude - a.magnitude);
      const take = Math.min(limit, candidates.length);
      for (let i = 0; i < take; i += 1) {
        selected.push({
          sourceIndex: candidates[i].sourceIndex,
          targetIndex: candidates[i].targetIndex,
          weight: candidates[i].weight,
        });
      }
    }
    return { selected, maxAbsWeight };
  }

  update(displayActivations, actualActivations) {
    this.layerMeshes.forEach((layer, layerIndex) => {
      const values = displayActivations[layerIndex];
      if (!values) return;
      const scale = layerIndex === 0 ? 1 : maxAbsValue(actualActivations[layerIndex]);
      this.applyNodeColors(layer.mesh, values, scale || 1);
    });

    this.connectionGroups.forEach((group) => {
      const sourceValues = actualActivations[group.sourceLayer];
      if (!sourceValues) return;
      this.applyConnectionColors(group, sourceValues);
    });
  }

  applyNodeColors(mesh, values, scale) {
    const safeScale = scale > 1e-6 ? scale : 1;
    for (let i = 0; i < values.length; i += 1) {
      const value = values[i];
      const intensity = Math.min(1, Math.abs(value) / safeScale);
      if (intensity < 0.015) {
        this.tempColor.setRGB(0.08, 0.1, 0.18);
      } else if (value >= 0) {
        const r = 0.14 + 0.86 * intensity;
        const g = 0.24 + 0.62 * intensity;
        const b = 0.28 + 0.18 * intensity;
        this.tempColor.setRGB(r, g, b);
      } else {
        const r = 0.16 + 0.24 * intensity;
        const g = 0.22 + 0.48 * intensity;
        const b = 0.32 + 0.68 * intensity;
        this.tempColor.setRGB(r, g, b);
      }
      mesh.setColorAt(i, this.tempColor);
    }
    mesh.instanceColor.needsUpdate = true;
  }

  applyConnectionColors(group, sourceValues) {
    const contributions = new Float32Array(group.connections.length);
    let maxContribution = 0;
    group.connections.forEach((connection, index) => {
      const activation = sourceValues[connection.sourceIndex] ?? 0;
      const contribution = activation * connection.weight;
      contributions[index] = contribution;
      const magnitude = Math.abs(contribution);
      if (magnitude > maxContribution) maxContribution = magnitude;
    });
    const scale = maxContribution > 1e-6 ? maxContribution : group.maxAbsWeight || 1;
    group.connections.forEach((connection, index) => {
      const value = contributions[index];
      const intensity = Math.min(1, Math.abs(value) / scale);
      if (intensity < 0.02) {
        this.tempColor.setRGB(0.08, 0.1, 0.18);
      } else if (value >= 0) {
        const r = 0.25 + 0.75 * intensity;
        const g = 0.32 + 0.45 * intensity;
        const b = 0.2 + 0.15 * intensity;
        this.tempColor.setRGB(r, g, b);
      } else {
        const r = 0.2 + 0.18 * intensity;
        const g = 0.28 + 0.4 * intensity;
        const b = 0.4 + 0.55 * intensity;
        this.tempColor.setRGB(r, g, b);
      }
      group.mesh.setColorAt(index, this.tempColor);
    });
    group.mesh.instanceColor.needsUpdate = true;
  }

  handleResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  animate() {
    this.renderer.setAnimationLoop(() => {
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
    });
  }
}

function softmax(values) {
  if (!values.length) return [];
  const maxVal = Math.max(...values);
  const exps = values.map((value) => Math.exp(value - maxVal));
  const sum = exps.reduce((acc, value) => acc + value, 0);
  return exps.map((value) => (sum === 0 ? 0 : value / sum));
}

function maxAbsValue(values) {
  let max = 0;
  for (let i = 0; i < values.length; i += 1) {
    const magnitude = Math.abs(values[i]);
    if (magnitude > max) {
      max = magnitude;
    }
  }
  return max;
}
