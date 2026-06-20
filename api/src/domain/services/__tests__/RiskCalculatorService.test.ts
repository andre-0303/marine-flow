import { describe, it, expect } from 'vitest'
import { RiskCalculatorServiceImpl } from '../RiskCalculatorService.js'
import { OceanCondition } from '../../entities/OceanCondition.js'

describe('RiskCalculatorService', () => {
  const svc = new RiskCalculatorServiceImpl()

  // windScore  = clamp(windSpeed/30, 0,1)*100   weight 20%
  // currentScore = clamp(currentStrength/5, 0,1)*100  weight 30%
  // tideScore  = clamp(max(0,tideLevel)/3, 0,1)*100  weight 30%
  // pollScore  = clamp(pollutionDensity/100, 0,1)*100 weight 20%
  // score = round(0.20*w + 0.30*c + 0.30*t + 0.20*p)

  const makeCondition = (
    windSpeed = 0,
    currentStrength = 0,
    tideLevel = 0,
    pollutionDensity = 0,
  ) => new OceanCondition('cond-1', 'region-1', windSpeed, currentStrength, tideLevel, pollutionDensity, new Date())

  it('score 0 e level low com todas condições zeradas', () => {
    const result = svc.calculate(makeCondition())
    expect(result.score).toBe(0)
    expect(result.level).toBe('low')
  })

  it('score 100 e level high com todas condições no máximo', () => {
    // windSpeed=30→100, current=5→100, tide=3→100, pollution=100→100
    // score = round(20+30+30+20) = 100
    const result = svc.calculate(makeCondition(30, 5, 3, 100))
    expect(result.score).toBe(100)
    expect(result.level).toBe('high')
  })

  it('score 39 → level low (abaixo do limiar medium)', () => {
    // todos os fatores = 39 → score = round(39) = 39
    const result = svc.calculate(makeCondition(11.7, 1.95, 1.17, 39))
    expect(result.score).toBe(39)
    expect(result.level).toBe('low')
  })

  it('score 40 → level medium (limiar inferior)', () => {
    // todos os fatores = 40 → score = round(40) = 40
    const result = svc.calculate(makeCondition(12, 2, 1.2, 40))
    expect(result.score).toBe(40)
    expect(result.level).toBe('medium')
  })

  it('score 69 → level medium (limiar superior)', () => {
    // todos os fatores = 69 → score = round(69) = 69
    const result = svc.calculate(makeCondition(20.7, 3.45, 2.07, 69))
    expect(result.score).toBe(69)
    expect(result.level).toBe('medium')
  })

  it('score 70 → level high (limiar inferior)', () => {
    // todos os fatores = 70 → score = round(70) = 70
    const result = svc.calculate(makeCondition(21, 3.5, 2.1, 70))
    expect(result.score).toBe(70)
    expect(result.level).toBe('high')
  })

  it('clamp: windSpeed acima do máximo não ultrapassa 100', () => {
    // windSpeed=9999 → windScore=100, resto=0 → score=round(20)=20
    const result = svc.calculate(makeCondition(9999, 0, 0, 0))
    expect(result.score).toBe(20)
    expect(result.level).toBe('low')
  })

  it('tideLevel negativo (maré baixa) é tratado como zero no cálculo', () => {
    // tideScore = max(0, -5)/3 * 100 = 0
    // windSpeed=30(100), current=5(100), tide=-5(0), pollution=100(100)
    // score = round(20+30+0+20) = 70 → high
    const result = svc.calculate(makeCondition(30, 5, -5, 100))
    expect(result.score).toBe(70)
    expect(result.level).toBe('high')
  })

  describe('explanation', () => {
    it('menciona fator dominante quando windScore >= 50', () => {
      // windSpeed=30 → windScore=100 >= 50
      const result = svc.calculate(makeCondition(30, 0, 0, 0))
      expect(result.explanation).toContain('vento forte')
    })

    it('menciona dois fatores dominantes quando ambos >= 50', () => {
      // windSpeed=30(100) e currentStrength=5(100), ambos >= 50
      const result = svc.calculate(makeCondition(30, 5, 0, 0))
      expect(result.explanation).toContain('vento forte')
      expect(result.explanation).toContain('correntes intensas')
    })

    it('menciona "parâmetros normais" quando nenhum fator >= 50', () => {
      // windSpeed=5(16.7), current=1(20), tide=1(33.3), pollution=10(10) — todos < 50
      const result = svc.calculate(makeCondition(5, 1, 1, 10))
      expect(result.explanation).toContain('parâmetros normais')
    })

    it('inclui score e level em português na explanation', () => {
      const result = svc.calculate(makeCondition(21, 3.5, 2.1, 70))
      expect(result.explanation).toContain('70')
      expect(result.explanation).toContain('alto')
    })
  })
})
