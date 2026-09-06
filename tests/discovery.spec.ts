import {test,expect} from '@playwright/test';

test('reading paths lead through published stories and back to projects',async({page})=>{
 await page.goto('/start-here/');
 await page.locator('.path-card').filter({hasText:'Building with AI'}).click();
 await expect(page.locator('.reading-path li')).toHaveCount(4);
 await page.getByRole('link',{name:'Building SoloAgent to understand AI harnesses',exact:true}).click();
 await expect(page.getByRole('link',{name:'Explore SoloAgent'})).toBeVisible();
 await expect(page.locator('.context-path').filter({hasText:'Building with AI'})).toContainText('3 of 4');
 await page.getByRole('link',{name:'Explore SoloAgent'}).click();
 const stories=page.getByRole('region',{name:'The story behind the build'});
 await expect(stories).toContainText('Week 3: SoloAgent');
 await expect(stories).toContainText('SoloAgent: finding the complexity');
});
test('recaps cite original sources and Now has a fixed editorial date',async({page})=>{
 await page.goto('/postmortems/roomba-wars/');
 await expect(page.locator('.reading-sidebar a').filter({hasText:'When AI in an interview fails you'})).toHaveAttribute('href','/articles/when-ai-in-an-interview-fails-you');
 await expect(page.locator('.article-content')).toContainText('What would change next time');
 await page.goto('/now/');
 await expect(page.locator('time')).toHaveAttribute('datetime','2026-09-06');
 await page.getByRole('button',{name:'Open search'}).click();
 await page.getByRole('combobox').fill('make the handoff');
 await expect(page.getByRole('option')).toContainText('Postmortem');
});
