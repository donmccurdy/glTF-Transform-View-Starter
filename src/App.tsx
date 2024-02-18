import "./App.css";
import { Canvas } from "@react-three/fiber";
import { PresentationControls } from "@react-three/drei";
import { RoomEnvironment } from "./components/RoomEnvironment";
import { ChangeEvent, useEffect, useState } from "react";
import { ColorUtils, Document, Material, WebIO } from "@gltf-transform/core";
import { KHRONOS_EXTENSIONS } from "@gltf-transform/extensions";
import { DocumentView } from "@gltf-transform/view";
import { Group } from "three";
import { downloadBytes } from "./utils/downloadBytes";

const IO = new WebIO().registerExtensions(KHRONOS_EXTENSIONS);

export function App() {
  const [url] = useState<string>("/Shoe.glb");
  const [variant, setVariant] = useState<string>("midnight");
  const [document, setDocument] = useState<Document | null>(null);
  const [documentView, setDocumentView] = useState<DocumentView | null>(null);
  const [group, setGroup] = useState<Group | null>(null);
  const [material, setMaterial] = useState<Material | null>(null);

  // Read GLB, and initialize DocumentView syncing it into the three.js scene.
  useEffect(() => {
    IO.read(url).then((document) => {
      const documentView = new DocumentView(document);
      const scene = document.getRoot().getDefaultScene()!;
      setDocument(document);
      setDocumentView(documentView);
      setGroup(documentView.view(scene));
      setMaterial(document.getRoot().listMaterials()[0]!);
    });
  }, [url]);

  // On variant change, assign a new baseColorTexture.
  useEffect(() => {
    if (!document || !documentView || !material) return;

    fetch(`/${variant}.jpg`)
      .then((res) => res.arrayBuffer())
      .then((buffer: ArrayBuffer) => {
        // Dispose previous texture.
        const srcTexture = material.getBaseColorTexture()!;
        srcTexture.dispose();

        // Create and assign new texture.
        const dstTexture = document
          .createTexture()
          .setImage(new Uint8Array(buffer))
          .setName(variant)
          .setMimeType("image/jpeg");
        material.setBaseColorTexture(dstTexture);

        // Run garbage collection for GPU resources.
        documentView.gc();
      });
  }, [document, documentView, variant]);

  function onChangeColor(event: ChangeEvent<HTMLInputElement>) {
    if (!material) return;

    // Assign base color texture. Hexadecimal colors are assumed to be sRGB;
    // hexToFactor does an implicit conversion to Linear-sRGB.
    const hex = Number(event.target.value.replace("#", "0x"));
    material.setBaseColorFactor(ColorUtils.hexToFactor(hex, [0, 0, 0, 1]));
  }

  function onChangeVariant(event: ChangeEvent<HTMLSelectElement>) {
    setVariant(event.target.value);
  }

  // Serialize current state of Document to GLB, and start a download.
  async function onDownloadClick() {
    if (!document) return;
    downloadBytes(await IO.writeBinary(document), `shoe-${variant}.glb`);
  }

  return (
    <>
      <header>
        <h1>glTF Transform View Starter</h1>
        <p>by Don McCurdy</p>
        <label>
          baseColorTexture
          <select value={variant} onChange={onChangeVariant}>
            <option value="beach">Beach</option>
            <option value="midnight">Midnight</option>
            <option value="street">Street</option>
          </select>
        </label>
        <label>
          baseColor
          <input type="color" defaultValue="#FFFFFF" onChange={onChangeColor} />
        </label>
        <label>
          <button onClick={onDownloadClick}>Download</button>
        </label>
      </header>
      <div id="container">
        <Canvas>
          <PresentationControls>
            {group && (
              <primitive
                position={[0, -0.5, 0]}
                scale={[15, 15, 15]}
                object={group}
              />
            )}
          </PresentationControls>
          <RoomEnvironment />
        </Canvas>
      </div>
    </>
  );
}
