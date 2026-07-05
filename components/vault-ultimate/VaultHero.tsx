'use client'

import { Suspense, useLayoutEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import * as THREE from 'three'
import vaultConfig from './vault-config-ultimate.json'
import VaultUltimateScene from './VaultUltimateScene'
import './vault-ultimate.css'

gsap.registerPlugin(ScrollTrigger)

function statusText(progress: number) {
  if (progress < 0.02) return 'LOCKED'
  if (progress < 0.2) return 'SPINNING WHEEL'
  if (progress < 0.35) return 'DISENGAGING BOLTS'
  if (progress < 0.45) return 'UNSEALING'
  if (progress < 0.8) return 'OPENING DOOR'
  if (progress < 0.95) return 'ACCESS GRANTED'
  return 'INTERIOR REVEALED'
}

export default function VaultHero() {
  const rootRef = useRef<HTMLElement>(null)
  const progressRef = useRef({ value: 0 })

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const statusEl = rootRef.current?.querySelector('.vault-ultimate-status')
      const progress = progressRef.current

      gsap.set('.vault-ultimate-content-card', { opacity: 0, y: 60, scale: 0.85 })

      const tl = gsap.timeline({
        defaults: { overwrite: 'auto' },
        scrollTrigger: {
          trigger: '.vault-ultimate-scroll',
          start: 'top top',
          end: vaultConfig.scrollTrigger.end,
          scrub: vaultConfig.scrollTrigger.scrub,
          pin: '.vault-ultimate-pin',
          anticipatePin: 1,
        },
      })

      tl.to(
        progress,
        {
          value: 1,
          duration: vaultConfig.progressAnimation.duration,
          ease: vaultConfig.progressAnimation.ease,
          onUpdate: () => {
            if (statusEl) {
              statusEl.textContent = `${statusText(progress.value)} · ${Math.round(
                progress.value * 100,
              )}%`
            }
          },
        },
        0,
      ).to(
        '.vault-ultimate-content-card',
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: vaultConfig.contentReveal.duration,
          ease: 'power2.out',
          stagger: vaultConfig.contentReveal.stagger,
        },
        vaultConfig.contentReveal.delayOffset,
      )
    }, rootRef)

    ScrollTrigger.refresh()

    return () => ctx.revert()
  }, [])

  return (
    <section className="vault-ultimate-page" ref={rootRef} aria-label="SketchLib vault intro">
      <div className="vault-ultimate-badge">
        <span>SketchLib</span>
        <strong>3D furniture for SketchUp</strong>
      </div>

      <div className="vault-ultimate-scroll">
        <div className="vault-ultimate-pin">
          <div className="vault-ultimate-canvas">
            <Canvas
              camera={{ fov: 32, near: 1, far: 2000, position: [0, 25, 780] }}
              dpr={[1, 2]}
              gl={{
                antialias: true,
                toneMapping: THREE.ACESFilmicToneMapping,
                toneMappingExposure: 1.12,
              }}
              onCreated={({ gl }) => {
                gl.outputColorSpace = THREE.SRGBColorSpace
                gl.shadowMap.enabled = true
                gl.shadowMap.type = THREE.PCFSoftShadowMap
              }}
            >
              <Suspense fallback={null}>
                <VaultUltimateScene progressRef={progressRef} />
              </Suspense>
            </Canvas>
          </div>

          <p className="vault-ultimate-status">LOCKED · 0%</p>

          <div className="vault-ultimate-overlay">
            <div className="vault-ultimate-content">
              <article className="vault-ultimate-content-card">
                <span>Inside the vault</span>
                <strong>Curated .skp models, ready for your projects.</strong>
                <p>
                  Living room, kitchen, bedroom — organized libraries with tags, creators, and
                  instant downloads inside SketchUp.
                </p>
              </article>
              <article className="vault-ultimate-content-card">
                <span>Unlock the library</span>
                <strong>Subscribe once. Download forever per pack.</strong>
                <p>
                  Scroll through to enter — then browse pricing, join the waitlist, or sign up
                  to start downloading.
                </p>
              </article>
            </div>
          </div>

          <div className="scroll-hint vault-ultimate-hint">
            <span>Scroll to unlock</span>
            <div />
          </div>
        </div>
      </div>
    </section>
  )
}
