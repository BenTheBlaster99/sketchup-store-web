'use client'

import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import UltimateWheel, { createUltimateWheelMaterials } from './UltimateWheel'

const R = 170
const THICK = 28
const MAX_SWING = (110 * Math.PI) / 180
const WHEEL_TURNS = 3
const BOLT_COUNT = 9

const SEG = {
  wheel: [0, 0.3],
  bolts: [0.2, 0.45],
  light: [0.35, 0.55],
  swing: [0.42, 0.8],
  camera: [0.55, 1],
} as const

const remap = (p: number, [a, b]: readonly [number, number]) =>
  p <= a ? 0 : p >= b ? 1 : (p - a) / (b - a)
const smooth = (t: number) => t * t * (3 - 2 * t)
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const seg = (p: number, key: keyof typeof SEG) => smooth(remap(p, SEG[key]))
const segEased = (p: number, key: keyof typeof SEG) =>
  easeInOutCubic(smooth(remap(p, SEG[key])))

function pseudoRandom(seed: number) {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453
  return x - Math.floor(x)
}

function VaultEnvironment() {
  const { gl, scene } = useThree()
  useLayoutEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    const texture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    // R3F scene environment assignment is intentional for IBL setup.
    // eslint-disable-next-line react-hooks/immutability -- Three.js scene mutation in effect
    scene.environment = texture

    return () => {
      texture.dispose()
      pmrem.dispose()
    }
  }, [gl, scene])
  return null
}

function DustParticles({ count = 260 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null)
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i += 1) {
      arr[i * 3] = (pseudoRandom(i * 3 + 1) - 0.5) * 520
      arr[i * 3 + 1] = (pseudoRandom(i * 3 + 2) - 0.5) * 520
      arr[i * 3 + 2] = -pseudoRandom(i * 3 + 3) * 420 - 40
    }
    return arr
  }, [count])

  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime
    ref.current.rotation.y = t * 0.015
    ref.current.rotation.x = Math.sin(t * 0.012) * 0.05
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={1.9}
        color="#ffd978"
        transparent
        opacity={0.15}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  )
}

interface VaultUltimateSceneProps {
  progressRef: React.RefObject<{ value: number }>
}

export default function VaultUltimateScene({ progressRef }: VaultUltimateSceneProps) {
  const doorPivotRef = useRef<THREE.Group>(null)
  const wheelGroupRef = useRef<THREE.Group>(null)
  const interiorLightRef = useRef<THREE.PointLight>(null)
  const interiorGlowRef = useRef<THREE.Mesh>(null)
  const interiorMeshRef = useRef<THREE.Mesh>(null)
  const boltRefs = useRef<(THREE.Group | null)[]>([])
  const { camera } = useThree()

  const tmpVec = useMemo(() => new THREE.Vector3(), [])
  const camStart = useMemo(() => new THREE.Vector3(0, 25, 780), [])
  const camMid = useMemo(() => new THREE.Vector3(-35, 28, 360), [])
  const camEnd = useMemo(() => new THREE.Vector3(-55, 22, -180), [])
  const lookStart = useMemo(() => new THREE.Vector3(0, 0, 0), [])
  const lookEnd = useMemo(() => new THREE.Vector3(0, 0, -300), [])

  const materials = useMemo(
    () => ({
      ...createUltimateWheelMaterials(),
      concrete: new THREE.MeshStandardMaterial({
        color: 0x18181a,
        metalness: 0.1,
        roughness: 0.95,
      }),
      interior: new THREE.MeshStandardMaterial({
        color: 0x050403,
        emissive: 0x3a2408,
        emissiveIntensity: 0,
        roughness: 0.9,
      }),
      gold: new THREE.MeshPhysicalMaterial({
        color: 0x7a6a53,
        metalness: 0.85,
        roughness: 0.4,
        clearcoat: 0.3,
        clearcoatRoughness: 0.2,
      }),
      frame: new THREE.MeshPhysicalMaterial({
        color: 0x242629,
        metalness: 0.9,
        roughness: 0.35,
        clearcoat: 0.1,
        clearcoatRoughness: 0.3,
      }),
      dark: new THREE.MeshPhysicalMaterial({
        color: 0x111214,
        metalness: 0.8,
        roughness: 0.6,
      }),
      steel: new THREE.MeshPhysicalMaterial({
        color: 0x3a3d42,
        metalness: 0.8,
        roughness: 0.3,
      }),
      steelDark: new THREE.MeshPhysicalMaterial({
        color: 0x222428,
        metalness: 0.9,
        roughness: 0.4,
        clearcoat: 0.2,
      }),
      chrome: new THREE.MeshPhysicalMaterial({
        color: 0xd0d5db,
        metalness: 1.0,
        roughness: 0.15,
        clearcoat: 1.0,
      }),
    }),
    [],
  )

  const wallGeo = useMemo(() => {
    const shape = new THREE.Shape()
    const sz = 340
    shape.moveTo(-sz, -sz)
    shape.lineTo(sz, -sz)
    shape.lineTo(sz, sz)
    shape.lineTo(-sz, sz)
    shape.lineTo(-sz, -sz)

    const hole = new THREE.Path()
    hole.absarc(0, 0, R + 22, 0, Math.PI * 2, true)
    shape.holes.push(hole)

    return new THREE.ExtrudeGeometry(shape, {
      depth: 44,
      bevelEnabled: true,
      bevelThickness: 3,
      bevelSize: 3,
      bevelSegments: 4,
    })
  }, [])

  const doorGeo = useMemo(() => {
    const geo = new THREE.CylinderGeometry(R, R, THICK, 128)
    geo.rotateX(Math.PI / 2)
    return geo
  }, [])

  const boltAngles = useMemo(
    () =>
      Array.from(
        { length: BOLT_COUNT },
        (_, i) => i * ((Math.PI * 2) / BOLT_COUNT) - Math.PI / 2 + 0.15,
      ),
    [],
  )

  useFrame(() => {
    const p = progressRef.current?.value ?? 0
    const wheelP = segEased(p, 'wheel')
    const boltP = seg(p, 'bolts')
    const lightP = seg(p, 'light')
    const swingP = segEased(p, 'swing')
    const camP = seg(p, 'camera')

    if (wheelGroupRef.current) {
      wheelGroupRef.current.rotation.z = wheelP * Math.PI * 2 * WHEEL_TURNS
    }

    boltRefs.current.forEach((boltGroup) => {
      if (boltGroup) boltGroup.position.x = R + 15 - 15 * boltP
    })

    if (doorPivotRef.current) {
      doorPivotRef.current.rotation.y = swingP * MAX_SWING
    }

    if (interiorMeshRef.current) {
      const interiorMaterial = interiorMeshRef.current.material as THREE.MeshStandardMaterial
      interiorMaterial.emissiveIntensity = lightP * 0.85
    }
    if (interiorLightRef.current) interiorLightRef.current.intensity = lightP * 2.6
    if (interiorGlowRef.current) {
      const glowMaterial = interiorGlowRef.current.material as THREE.MeshBasicMaterial
      glowMaterial.opacity = lightP * 0.55
    }

    if (camP <= 0.5) {
      const t = easeInOutCubic(camP * 2)
      camera.position.lerpVectors(camStart, camMid, t)
      tmpVec.lerpVectors(lookStart, lookEnd, t * 0.3)
    } else {
      const t = easeInOutCubic((camP - 0.5) * 2)
      camera.position.lerpVectors(camMid, camEnd, t)
      tmpVec.lerpVectors(lookStart, lookEnd, 0.3 + t * 0.7)
    }
    camera.lookAt(tmpVec)
  })

  return (
    <>
      <VaultEnvironment />
      <color attach="background" args={['#030304']} />
      <fog attach="fog" args={['#030304', 900, 1800]} />

      <hemisphereLight args={[0x556677, 0x030304, 0.15]} />
      <directionalLight
        intensity={3.5}
        position={[-200, 400, 500]}
        color="#fff0e0"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0005}
      />
      <directionalLight intensity={2.0} position={[400, 100, 100]} color="#aaccff" />
      <directionalLight intensity={1.5} position={[-300, -300, 200]} color="#ffffff" />
      <pointLight color="#ffd978" intensity={0.2} distance={1400} position={[0, 220, 320]} />

      <mesh geometry={wallGeo} material={materials.concrete} position={[0, 0, -THICK / 2 - 44]} />

      <mesh position={[0, 0, -THICK / 2 - 2]} material={materials.frame}>
        <torusGeometry args={[R + 22, 15, 20, 80]} />
      </mesh>

      <mesh position={[0, 0, -THICK / 2 + 1]} material={materials.dark}>
        <torusGeometry args={[R + 10, 4, 12, 64]} />
      </mesh>

      {boltAngles.map((angle, i) => {
        const x = Math.cos(angle) * (R + 15)
        const y = Math.sin(angle) * (R + 15)
        return (
          <mesh
            key={`hole-${i}`}
            material={materials.dark}
            position={[x, y, 0]}
            rotation={[0, 0, angle + Math.PI / 2]}
          >
            <cylinderGeometry args={[10, 10, 8, 16]} />
          </mesh>
        )
      })}

      <mesh ref={interiorMeshRef} position={[0, 0, -340]}>
        <planeGeometry args={[640, 640]} />
        <primitive object={materials.interior} attach="material" />
      </mesh>
      <mesh ref={interiorGlowRef} position={[0, 0, -290]}>
        <planeGeometry args={[420, 420]} />
        <meshBasicMaterial color="#ffb046" transparent opacity={0} depthWrite={false} />
      </mesh>
      <pointLight
        ref={interiorLightRef}
        color="#ffb046"
        intensity={0}
        distance={1100}
        decay={1.5}
        position={[0, 0, -220]}
      />

      {Array.from({ length: 6 }, (_, i) => (
        <mesh
          key={`bar-${i}`}
          material={materials.gold}
          position={[-110 + i * 38, -135 + (i % 2) * 6, -295 + (i % 3) * 5]}
          rotation={[0, 0.15 * (i % 2 === 0 ? 1 : -1), 0.08]}
        >
          <boxGeometry args={[52, 20, 28]} />
        </mesh>
      ))}

      {[-1, 1].map((dir) => (
        <group key={`hinge-${dir}`} position={[R + 12, dir * R * 0.6, 0]}>
          <mesh material={materials.steelDark}>
            <boxGeometry args={[24, 70, THICK + 10]} />
          </mesh>
          <mesh material={materials.chrome} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[6, 6, THICK + 20, 16]} />
          </mesh>
          <mesh material={materials.dark} position={[0, 25, THICK / 2 + 6]}>
            <cylinderGeometry args={[3, 3, 4, 8]} />
          </mesh>
          <mesh material={materials.dark} position={[0, -25, THICK / 2 + 6]}>
            <cylinderGeometry args={[3, 3, 4, 8]} />
          </mesh>
        </group>
      ))}

      <group ref={doorPivotRef} position={[R, 0, 0]}>
        <mesh geometry={doorGeo} material={materials.steelDark} position={[-R, 0, 0]} />

        <mesh material={materials.steelDark} position={[-R, 0, THICK / 2 + 0.6]}>
          <torusGeometry args={[R - 14, 5.5, 14, 96]} />
        </mesh>
        <mesh material={materials.frame} position={[-R, 0, THICK / 2 + 0.6]}>
          <torusGeometry args={[R - 38, 3.5, 12, 80]} />
        </mesh>
        <mesh material={materials.dark} position={[-R, 0, THICK / 2 + 0.6]}>
          <torusGeometry args={[R - 60, 2, 10, 64]} />
        </mesh>

        {Array.from({ length: 24 }, (_, i) => {
          const angle = (i / 24) * Math.PI * 2
          const rx = Math.cos(angle) * (R - 25)
          const ry = Math.sin(angle) * (R - 25)
          return (
            <mesh
              key={`rivet-${i}`}
              material={materials.chrome}
              position={[-R + rx, ry, THICK / 2 + 1.5]}
            >
              <sphereGeometry args={[2.6, 12, 12]} />
            </mesh>
          )
        })}

        <group position={[-R, 0, THICK / 2 + 9]}>
          <UltimateWheel wheelRef={wheelGroupRef} materials={materials} />
        </group>

        <group position={[-R, 0, 0]}>
          {boltAngles.map((angle, i) => (
            <group key={`bolt-${i}`} rotation={[0, 0, angle]}>
              <group
                ref={(node) => {
                  boltRefs.current[i] = node
                }}
                position={[R + 15, 0, 0]}
              >
                <mesh
                  material={materials.steelDark}
                  position={[-15, 0, 0]}
                  rotation={[0, 0, Math.PI / 2]}
                >
                  <cylinderGeometry args={[13, 13, 6, 16]} />
                </mesh>
                <mesh material={materials.chrome} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[8, 8, 30, 20]} />
                </mesh>
                <mesh
                  material={materials.chrome}
                  position={[15, 0, 0]}
                  rotation={[0, 0, Math.PI / 2]}
                >
                  <sphereGeometry args={[8, 16, 16]} />
                </mesh>
              </group>
            </group>
          ))}
        </group>
      </group>

      <DustParticles count={260} />
    </>
  )
}
