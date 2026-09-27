import {test, expect} from '@playwright/test';

test('homepage reaches learning page and visualizer', async ({page}) => {
  await page.goto('/');
  await page.getByRole('link', {name: 'Learn', exact: true}).click();
  await expect(page).toHaveURL(/learn\.html$/);
  await expect(page.locator('article section[id]')).toHaveCount(8);
  await page.getByRole('link', {name: 'Visualizer', exact: true}).click();
  await expect(page.locator('#status')).toHaveText('Trace ready');
});

test('run output and playback controls follow real code', async ({page}) => {
  await page.goto('/visualizer.html');
  await expect(page.locator('#status')).toHaveText('Trace ready');
  await page.getByRole('textbox', {name: 'Source code'}).fill('let total = 2; total += 3; console.log(total);');
  await page.getByRole('button', {name: /Run & Visualize/}).click();
  await expect(page.locator('#status')).toHaveText('Trace ready');
  await page.getByLabel('Execution step', {exact: true}).focus();
  await page.keyboard.press('End');
  await expect(page.locator('.outrow')).toContainText('5');
  await page.getByRole('button', {name: 'Previous step', exact: true}).click();
  await expect(page.getByRole('button', {name: 'Next step', exact: true})).toBeEnabled();
  await page.getByRole('button', {name: 'Reset', exact: true}).click();
  await expect(page.locator('#steptext')).toContainText('Step 1 of');
  await page.getByRole('button', {name: 'Play', exact: true}).click();
  await expect(page.getByRole('button', {name: 'Pause', exact: true})).toBeVisible();
  await page.getByRole('button', {name: 'Pause', exact: true}).click();
});

test('practice filters, empty state, and starter loading', async ({page}) => {
  await page.goto('/visualizer.html');
  await page.getByRole('button', {name: 'Practice', exact: true}).click();
  await expect(page.locator('.exercise-card')).toHaveCount(20);
  await page.getByRole('button', {name: /Level 3/}).click();
  await page.getByLabel('Find an exercise').fill('trapping');
  await expect(page.locator('.exercise-card')).toHaveCount(1);
  await page.getByLabel('Find an exercise').fill('no-match-xyz');
  await expect(page.locator('#practice-list')).toContainText('No exercises match');
  await page.getByLabel('Find an exercise').fill('trapping');
  await page.getByRole('button', {name: /Load JavaScript starter/}).click();
  await expect(page.locator('#modal')).not.toBeVisible();
  await expect(page.locator('#code')).toHaveValue(/TODO/);
  await expect(page.locator('#status')).toContainText('Starter loaded');
});

test('Escape closes practice and restores keyboard focus', async ({page}) => {
  await page.goto('/visualizer.html');
  const trigger = page.getByRole('button', {name: 'Practice', exact: true});
  await trigger.click();
  await page.keyboard.press('Escape');
  await expect(page.locator('#modal')).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

test('clicking dialog padding keeps practice open', async ({page}) => {
  await page.goto('/visualizer.html');
  await page.getByRole('button', {name: 'Practice', exact: true}).click();
  await page.locator('#modal').click({position: {x: 8, y: 8}});
  await expect(page.locator('#modal')).toBeVisible();
});

test('backdrop click closes practice', async ({page}) => {
  await page.goto('/visualizer.html');
  await page.getByRole('button', {name: 'Practice', exact: true}).click();
  await page.mouse.click(1, 1);
  await expect(page.locator('#modal')).not.toBeVisible();
});

test('learning highlight tracks scrolling and answers expand', async ({page}) => {
  await page.goto('/learn.html');
  await page.locator('aside a[href="#step-5"]').click();
  await expect(page.locator('aside a[aria-current="step"]')).toHaveAttribute('href', '#step-5');
  const answer = page.locator('#step-5 details').first();
  await answer.locator('summary').click();
  await expect(answer).toHaveAttribute('open', '');
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(page.locator('aside a[aria-current="step"]')).toHaveAttribute('href', '#step-1');
});

test('planned language shows a clear error instead of simulated output', async ({page}) => {
  await page.goto('/visualizer.html');
  await page.getByLabel('Programming language').selectOption('Python');
  await page.getByRole('button', {name: /Run & Visualize/}).click();
  await expect(page.locator('#consolebody')).toContainText('Python runtime is not installed');
  await expect(page.getByRole('button', {name: 'Play', exact: true})).toBeDisabled();
});
