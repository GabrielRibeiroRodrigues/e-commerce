import { test, expect } from '@playwright/test'

test.describe('Autenticação', () => {
  test('página de login carrega corretamente', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: /entrar/i })).toBeVisible()
    await expect(page.getByLabel(/usuário/i)).toBeVisible()
    await expect(page.getByLabel(/senha/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /entrar/i })).toBeVisible()
  })

  test('exibe erro com credenciais inválidas', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel(/usuário/i).fill('usuario_invalido')
    await page.getByLabel(/senha/i).fill('senha_errada')
    await page.getByRole('button', { name: /entrar/i }).click()
    await expect(page.getByText(/usuário ou senha incorretos/i)).toBeVisible()
  })

  test('página de registro carrega corretamente', async ({ page }) => {
    await page.goto('/registro')
    await expect(page.getByRole('heading', { name: /criar conta/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /criar conta/i })).toBeVisible()
  })

  test('link de cadastro na página de login', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('link', { name: /criar conta/i }).click()
    await expect(page).toHaveURL('/registro')
  })

  test('link de login na página de registro', async ({ page }) => {
    await page.goto('/registro')
    await page.getByRole('link', { name: /entrar/i }).click()
    await expect(page).toHaveURL('/login')
  })
})
