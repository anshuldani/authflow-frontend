'use client'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const MAIN_COUNT = 120
const DEPTH_COUNT = 20
const COLORS = [0x3b82f6, 0x7c3aed, 0x0ea5e9, 0x6366f1]
const CONNECTION_DIST = 180

type ParticleData = {
  mesh: THREE.Mesh
  vx: number
  vy: number
  phase: number
  amp: number
  pulsePhase: number
}

export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
    renderer.setClearColor(0x000000, 0)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight, false)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000)
    camera.position.z = 400

    const mainGeo = new THREE.SphereGeometry(2.5, 8, 8)
    const mainParticles: ParticleData[] = []

    for (let i = 0; i < MAIN_COUNT; i++) {
      const mat = new THREE.MeshBasicMaterial({
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        transparent: true,
        opacity: Math.random() * 0.6 + 0.2,
      })
      const mesh = new THREE.Mesh(mainGeo, mat)
      mesh.position.set(
        (Math.random() - 0.5) * 1400,
        (Math.random() - 0.5) * 800,
        (Math.random() - 0.5) * 200,
      )
      scene.add(mesh)
      mainParticles.push({
        mesh,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        phase: Math.random() * Math.PI * 2,
        amp: Math.random() * 0.8 + 0.3,
        pulsePhase: Math.random() * Math.PI * 2,
      })
    }

    const anchorGeo = new THREE.SphereGeometry(6, 8, 8)
    const anchorParticles: ParticleData[] = []

    for (let i = 0; i < 3; i++) {
      const mat = new THREE.MeshBasicMaterial({ color: 0x60a5fa, transparent: true, opacity: 0.5 })
      const mesh = new THREE.Mesh(anchorGeo, mat)
      mesh.position.set(
        (Math.random() - 0.5) * 800,
        (Math.random() - 0.5) * 400,
        0,
      )
      scene.add(mesh)
      anchorParticles.push({
        mesh,
        vx: (Math.random() - 0.5) * 0.05,
        vy: (Math.random() - 0.5) * 0.05,
        phase: Math.random() * Math.PI * 2,
        amp: Math.random() * 0.4 + 0.1,
        pulsePhase: Math.random() * Math.PI * 2,
      })
    }

    const connParticles = [...mainParticles, ...anchorParticles]

    const depthGeo = new THREE.SphereGeometry(4, 8, 8)
    const depthMat = new THREE.MeshBasicMaterial({ color: 0xbfdbfe, transparent: true, opacity: 0.3 })
    const depthParticles: ParticleData[] = []

    for (let i = 0; i < DEPTH_COUNT; i++) {
      const mesh = new THREE.Mesh(depthGeo, depthMat)
      mesh.position.set(
        (Math.random() - 0.5) * 1400,
        (Math.random() - 0.5) * 800,
        (Math.random() - 0.5) * 300,
      )
      scene.add(mesh)
      depthParticles.push({
        mesh,
        vx: (Math.random() - 0.5) * 0.12,
        vy: (Math.random() - 0.5) * 0.12,
        phase: Math.random() * Math.PI * 2,
        amp: 0.2,
        pulsePhase: Math.random() * Math.PI * 2,
      })
    }

    const linesGroup = new THREE.Group()
    scene.add(linesGroup)

    const mouse = { x: 0, y: 0 }
    const mouseWorld = { x: 0, y: 0 }

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX / window.innerWidth - 0.5
      mouse.y = e.clientY / window.innerHeight - 0.5
      const halfH = Math.tan((75 / 2) * Math.PI / 180) * camera.position.z
      const halfW = halfH * (window.innerWidth / window.innerHeight)
      mouseWorld.x = (e.clientX / window.innerWidth - 0.5) * 2 * halfW
      mouseWorld.y = -(e.clientY / window.innerHeight - 0.5) * 2 * halfH
    }
    window.addEventListener('mousemove', onMouseMove)

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight, false)
    }
    window.addEventListener('resize', onResize)

    let rafId: number
    const cd2 = CONNECTION_DIST * CONNECTION_DIST

    const updateParticle = (p: ParticleData, now: number) => {
      const pos = p.mesh.position
      pos.x += p.vx
      pos.y += p.vy
      pos.y += Math.sin(now * 0.0008 + p.phase) * p.amp * 0.04
      pos.x += Math.cos(now * 0.0006 + p.phase) * p.amp * 0.02
      const s = 1 + Math.sin(now * 0.001 + p.pulsePhase) * 0.3
      p.mesh.scale.setScalar(s)
      const dx = pos.x - mouseWorld.x
      const dy = pos.y - mouseWorld.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < 120 && dist > 0.01) {
        const force = (120 - dist) / 120 * 0.8
        pos.x += (dx / dist) * force
        pos.y += (dy / dist) * force
      }
      if (pos.x > 700) pos.x = -700
      if (pos.x < -700) pos.x = 700
      if (pos.y > 400) pos.y = -400
      if (pos.y < -400) pos.y = 400
    }

    const animate = () => {
      rafId = requestAnimationFrame(animate)
      const now = Date.now()

      for (const p of connParticles) updateParticle(p, now)
      for (const p of depthParticles) updateParticle(p, now)

      camera.position.x += (mouse.x * 50 - camera.position.x) * 0.06
      camera.position.y += (-mouse.y * 35 - camera.position.y) * 0.06

      for (const child of linesGroup.children) {
        const line = child as THREE.Line
        line.geometry.dispose()
        ;(line.material as THREE.Material).dispose()
      }
      linesGroup.clear()

      const breathe = 0.7 + Math.sin(now * 0.0005) * 0.3
      for (let i = 0; i < connParticles.length; i++) {
        for (let j = i + 1; j < connParticles.length; j++) {
          const a = connParticles[i].mesh.position
          const b = connParticles[j].mesh.position
          const dx = a.x - b.x, dy = a.y - b.y, dz = a.z - b.z
          const dist2 = dx * dx + dy * dy + dz * dz
          if (dist2 < cd2) {
            const dist = Math.sqrt(dist2)
            const opacity = (1 - dist / CONNECTION_DIST) * 0.2 * breathe
            const lineGeo = new THREE.BufferGeometry().setFromPoints([a, b])
            const lineMat = new THREE.LineBasicMaterial({ color: 0x3b82f6, transparent: true, opacity })
            linesGroup.add(new THREE.Line(lineGeo, lineMat))
          }
        }
      }

      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', onResize)
      for (const child of linesGroup.children) {
        const line = child as THREE.Line
        line.geometry.dispose()
        ;(line.material as THREE.Material).dispose()
      }
      mainGeo.dispose()
      anchorGeo.dispose()
      depthGeo.dispose()
      depthMat.dispose()
      connParticles.forEach(p => (p.mesh.material as THREE.Material).dispose())
      renderer.dispose()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0, pointerEvents: 'none' }}
    />
  )
}
