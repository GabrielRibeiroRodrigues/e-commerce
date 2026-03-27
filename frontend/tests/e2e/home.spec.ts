import { test, expect } from '@playwright/test'

test.describe('Home', () => {
  test('exibe o título da farmácia', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toContainText('Farmácia QUEOPS')
  })

  test('tem link para ver todos os produtos', async ({ page }) => {
    await page.goto('/')
    const link = page.getByRole('link', { name: /ver todos os produtos/i })
    await expect(link).toBeVisible()
    await link.click()
    await expect(page).toHaveURL('/produtos')
  })

  test('header tem link de login quando não autenticado', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('link', { name: /entrar/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /cadastrar/i })).toBeVisible()
  })
})
