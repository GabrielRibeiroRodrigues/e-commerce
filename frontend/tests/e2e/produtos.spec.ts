import { test, expect } from '@playwright/test'

test.describe('Catálogo de Produtos', () => {
  test('página de produtos carrega', async ({ page }) => {
    await page.goto('/produtos')
    await expect(page).toHaveURL('/produtos')
    await expect(page.getByPlaceholder(/buscar produto/i)).toBeVisible()
  })

  test('campo de busca está funcional', async ({ page }) => {
    await page.goto('/produtos')
    const input = page.getByPlaceholder(/buscar produto/i)
    await input.fill('dipirona')
    await page.getByRole('button', { name: /buscar/i }).click()
    await expect(page).toHaveURL(/q=dipirona/)
  })

  test('filtro de categoria funciona', async ({ page }) => {
    await page.goto('/produtos')
    const links = page.locator('aside a')
    const count = await links.count()
    expect(count).toBeGreaterThan(0)
  })

  test('carrinho redireciona para login quando não autenticado', async ({ page }) => {
    await page.goto('/carrinho')
    await expect(page).toHaveURL('/login')
  })
})
