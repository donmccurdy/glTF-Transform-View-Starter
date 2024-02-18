import "./App.css";
import { Canvas } from "@react-three/fiber";
import { PresentationControls, Shadow } from "@react-three/drei";
import { RoomEnvironment } from "./components/RoomEnvironment";
import { useEffect, useState } from "react";
import { Document, WebIO } from "@gltf-transform/core";
import { KHRONOS_EXTENSIONS } from "@gltf-transform/extensions";
import { DocumentView } from "@gltf-transform/view";
import { Group } from "three";

const IO = new WebIO().registerExtensions(KHRONOS_EXTENSIONS);

export function App() {
  const [url] = useState<string>("/Duck.glb");
  const [document, setDocument] = useState<Document | null>(null);
  const [documentView, setDocumentView] = useState<DocumentView | null>(null);
  const [group, setGroup] = useState<Group | null>(null);

  useEffect(() => {
    IO.read(url).then((document) => {
      const documentView = new DocumentView(document);
      const scene = document.getRoot().getDefaultScene();
      setDocument(document);
      setDocumentView(documentView);
      setGroup(documentView.view(scene));
    });
  }, [url]);

  return (
    <>
      <header>
        <h1>glTF Transform View Starter</h1>
        <p>by Don McCurdy</p>
      </header>
      <div id="container">
        <Canvas>
          <PresentationControls>
            {group && <primitive object={group} />}
            <Shadow
              position={[0, 0, 0]}
              scale={[3, 1, 1]}
              color="#1f290f"
              colorStop={0}
              opacity={0.25}
            />
          </PresentationControls>
          <RoomEnvironment />
        </Canvas>
      </div>
    </>
  );
}
