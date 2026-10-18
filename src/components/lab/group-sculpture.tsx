'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './lab.module.css';

type Props = { variant: 'circle' | 'assembly' };

/** Original shared-circle sculpture. Rendering stops when it settles or leaves view. */
export function GroupSculpture({ variant }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let cancelled = false;
    let cleanup = () => {};
    async function mount() {
      const [THREE, { RoomEnvironment }, { RoundedBoxGeometry }] = await Promise.all([
        import('three'),
        import('three/addons/environments/RoomEnvironment.js'),
        import('three/addons/geometries/RoundedBoxGeometry.js'),
      ]);
      if (cancelled || !element) return;
      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
      renderer.setClearColor(0x000000, 0);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1;
      element.appendChild(renderer.domElement);
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(34, 1, .1, 100);
      camera.position.set(0, 0, variant === 'circle' ? 8.5 : 9.8);
      const generator = new THREE.PMREMGenerator(renderer);
      const room = new RoomEnvironment();
      const environment = generator.fromScene(room, .04);
      scene.environment = environment.texture;
      scene.environmentIntensity = .7;
      const key = new THREE.DirectionalLight(0xffffff, 1.8);
      key.position.set(-3, 5, 6);
      scene.add(key, new THREE.HemisphereLight(0xffffff, 0x466fc2, .7));
      const sculpture = new THREE.Group();
      scene.add(sculpture);
      const materials: InstanceType<typeof THREE.Material>[] = [];
      const textures: InstanceType<typeof THREE.Texture>[] = [];
      const material = (color: string, metalness = .2) => {
        const result = new THREE.MeshPhysicalMaterial({ color, metalness, roughness: .25, clearcoat: .8, clearcoatRoughness: .2 });
        materials.push(result);
        return result;
      };
      const blue = material('#086df1');
      const pale = material('#a8d7ff');
      const orange = material('#ff8b38');
      const silver = material('#f5f7ff', .65);
      if (variant === 'circle') {
        const colors = [blue, blue, pale, orange];
        for (let i = 0; i < 4; i++) {
          const arc = new THREE.Mesh(new THREE.TorusGeometry(1.85, .36, 32, 72, Math.PI / 2 - .1), colors[i]);
          arc.rotation.z = i * Math.PI / 2 + .05;
          arc.position.z = i % 2 ? .15 : -.15;
          sculpture.add(arc);
          // Rounded ends keep the separated pieces tactile rather than machined.
          for (const angle of [i * Math.PI / 2 + .05, (i + 1) * Math.PI / 2 - .05]) {
            const end = new THREE.Mesh(new THREE.SphereGeometry(.36, 24, 16), colors[i]);
            end.position.set(Math.cos(angle) * 1.85, Math.sin(angle) * 1.85, arc.position.z);
            sculpture.add(end);
          }
        }
        sculpture.rotation.set(.2, -.35, -.25);
      } else {
        const purple = material('#a391ff', .3);
        const yellow = material('#efff70', .1);
        const geometry = new RoundedBoxGeometry(1.38, 1.38, 1.38, 5, .25);
        const colors = [purple, silver, yellow, purple, purple, blue, silver, purple];
        for (let i = 0; i < 8; i++) {
          const block = new THREE.Mesh(geometry, colors[i]);
          block.position.set((i % 2 - .5) * 1.52, (Math.floor(i / 2) % 2 - .5) * 1.52, (Math.floor(i / 4) - .5) * 1.52);
          sculpture.add(block);
        }
        const texture = new THREE.TextureLoader().load('/images/nigerian-wedding.webp', () => { if (!cancelled) renderer.render(scene, camera); });
        texture.colorSpace = THREE.SRGBColorSpace;
        textures.push(texture);
        const photoMaterial = new THREE.MeshBasicMaterial({ map: texture, toneMapped: false });
        materials.push(photoMaterial);
        const frame = new THREE.Mesh(new RoundedBoxGeometry(3.25, 2.25, .18, 4, .08), purple);
        frame.position.z = 1.57;
        const photograph = new THREE.Mesh(new THREE.PlaneGeometry(3.04, 2.03), photoMaterial);
        photograph.position.z = 1.67;
        sculpture.add(frame, photograph);
        sculpture.rotation.set(.22, -.35, -.12);
      }
      const initial = sculpture.rotation.clone();
      let targetX = 0, targetY = 0, currentX = 0, currentY = 0;
      let frame = 0, visible = true;
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
      function draw() {
        frame = 0;
        if (cancelled || !visible || document.hidden) return;
        currentX += (targetX - currentX) * .09;
        currentY += (targetY - currentY) * .09;
        sculpture.rotation.x = initial.x + currentY * .2;
        sculpture.rotation.y = initial.y + currentX * .25;
        renderer.render(scene, camera);
        if (Math.abs(targetX - currentX) + Math.abs(targetY - currentY) > .002) frame = requestAnimationFrame(draw);
      }
      const schedule = () => { if (!frame) frame = requestAnimationFrame(draw); };
      const resize = () => {
        const bounds = element!.getBoundingClientRect();
        if (!bounds.width || !bounds.height) return;
        renderer.setSize(bounds.width, bounds.height);
        camera.aspect = bounds.width / bounds.height;
        camera.updateProjectionMatrix();
        schedule();
      };
      const move = (event: PointerEvent) => {
        if (reduced.matches || event.pointerType === 'touch') return;
        const bounds = element!.getBoundingClientRect();
        targetX = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1));
        targetY = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1));
        schedule();
      };
      const reset = () => { targetX = targetY = 0; schedule(); };
      const visibility = () => { if (document.hidden) cancelAnimationFrame(frame); frame = 0; schedule(); };
      const observer = new ResizeObserver(resize);
      observer.observe(element);
      const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) schedule(); });
      intersection.observe(element);
      element.addEventListener('pointermove', move);
      element.addEventListener('pointerleave', reset);
      reduced.addEventListener('change', reset);
      document.addEventListener('visibilitychange', visibility);
      resize();
      setReady(true);
      cleanup = () => {
        cancelAnimationFrame(frame);
        observer.disconnect(); intersection.disconnect();
        element.removeEventListener('pointermove', move); element.removeEventListener('pointerleave', reset);
        reduced.removeEventListener('change', reset); document.removeEventListener('visibilitychange', visibility);
        sculpture.traverse(object => { if (object instanceof THREE.Mesh) object.geometry.dispose(); });
        materials.forEach(item => item.dispose()); textures.forEach(item => item.dispose());
        environment.dispose(); room.dispose(); generator.dispose(); renderer.dispose();
        renderer.domElement.remove();
      };
    }
    mount().catch(() => { /* Keep the CSS artwork when WebGL is unavailable. */ });
    return () => { cancelled = true; cleanup(); };
  }, [variant]);
  return <div ref={host} className={`${styles.sculpture} ${ready ? styles.ready : ''}`} aria-hidden="true"><div className={styles.fallbackShape} /></div>;
}
