import { useMemo } from 'react'
import * as THREE from 'three'

export function createUltimateWheelMaterials() {
  return {
    chrome: new THREE.MeshPhysicalMaterial({
      color: 0xf0f4f8,
      metalness: 1,
      roughness: 0.02,
      clearcoat: 1,
      clearcoatRoughness: 0.02,
      envMapIntensity: 2.5,
    }),
    dark: new THREE.MeshStandardMaterial({
      color: 0x050508,
      metalness: 0.3,
      roughness: 0.8,
    }),
    steel: new THREE.MeshPhysicalMaterial({
      color: 0x7a7f86,
      metalness: 0.92,
      roughness: 0.28,
      clearcoat: 0.35,
      clearcoatRoughness: 0.18,
      envMapIntensity: 1.6,
    }),
    steelDark: new THREE.MeshPhysicalMaterial({
      color: 0x3a3e44,
      metalness: 0.88,
      roughness: 0.35,
      clearcoat: 0.2,
      clearcoatRoughness: 0.25,
    }),
  }
}

type WheelMaterials = ReturnType<typeof createUltimateWheelMaterials>

interface UltimateWheelProps {
  wheelRef: React.RefObject<THREE.Group | null>
  materials?: WheelMaterials & Record<string, THREE.Material>
}

export default function UltimateWheel({ wheelRef, materials: externalMaterials }: UltimateWheelProps) {
  const internalMaterials = useMemo(() => createUltimateWheelMaterials(), [])
  const materials = externalMaterials ?? internalMaterials

  return (
    <group ref={wheelRef}>
      <mesh material={materials.chrome}>
        <torusGeometry args={[90, 8.5, 18, 72]} />
      </mesh>
      <mesh material={materials.chrome} position={[0, 0, 1.5]}>
        <torusGeometry args={[62, 4.5, 14, 56]} />
      </mesh>
      <mesh material={materials.chrome} position={[0, 0, 4]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[38, 38, 18, 56]} />
      </mesh>
      <mesh material={materials.dark} position={[0, 0, 14]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[20, 20, 5, 36]} />
      </mesh>
      <mesh material={materials.chrome} position={[0, 0, 17]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[8, 8, 3, 24]} />
      </mesh>

      {Array.from({ length: 6 }, (_, i) => (
        <group key={`spoke-${i}`} rotation={[0, 0, i * ((Math.PI * 2) / 6)]}>
          <mesh material={materials.chrome} position={[45, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[7, 7, 90, 20]} />
          </mesh>
          <mesh material={materials.dark} position={[90, 0, 0]}>
            <torusGeometry args={[8, 3, 12, 24]} />
          </mesh>
        </group>
      ))}
    </group>
  )
}
