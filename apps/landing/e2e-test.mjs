import { chromium } from 'playwright';

(async () => {
  console.log('🚀 Starting E2E UI Tests for AgentPay Landing Page...');
  
  // Launch Chromium
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();
  
  try {
    console.log('\n1. Navigating to http://localhost:4321...');
    await page.goto('http://localhost:4321');

    // TEST 1: Splash Screen Visibility
    console.log('\n2. Testing Splash Screen...');
    const splash = page.locator('#splash-screen');
    const isVisibleInitial = await splash.isVisible();
    if (isVisibleInitial) {
      console.log('✅ Splash screen is visible on load.');
    } else {
      console.error('❌ Splash screen NOT found or not visible.');
    }

    // Wait for splash screen to disappear
    console.log('Waiting for splash screen to fade out (3 seconds)...');
    await page.waitForTimeout(3000);
    
    // Test if pointer-events is none or opacity is 0 or display is none
    const isSplashHidden = !(await splash.isVisible()) || await splash.evaluate(el => window.getComputedStyle(el).opacity === '0');
    if (isSplashHidden) {
      console.log('✅ Splash screen faded out successfully.');
    } else {
      console.error('❌ Splash screen is still visible.');
    }

    // TEST 2: Initial 3D Agent Frame
    console.log('\n3. Testing Initial 3D Character Frame (Opacity Logic)...');
    
    const frame1Opacity = await page.locator('.agent-frame').nth(0).evaluate(el => window.getComputedStyle(el).opacity);
    if (parseFloat(frame1Opacity) > 0.9) {
      console.log(`✅ Frame 1 opacity is correct: ${frame1Opacity}`);
    } else {
      console.error(`❌ Frame 1 opacity is incorrect: ${frame1Opacity}`);
    }

    // TEST 3: Parallax Scroll Sequence (Crossfade)
    console.log('\n4. Testing Parallax Scroll Sequence...');
    console.log('Scrolling down by 1600px...'); // 2x viewport height (1600px)
    await page.mouse.wheel(0, 1600);
    await page.waitForTimeout(1000); // Wait for lenis & JS to process

    const newFrame1Opacity = await page.locator('.agent-frame').nth(0).evaluate(el => window.getComputedStyle(el).opacity);
    const frame5Opacity = await page.locator('.agent-frame').nth(4).evaluate(el => window.getComputedStyle(el).opacity);
    
    if (parseFloat(newFrame1Opacity) < 0.5) {
      console.log(`✅ Frame 1 correctly faded out on scroll. Opacity: ${newFrame1Opacity}`);
    } else {
      console.error(`❌ Frame 1 did not fade out, opacity is still: ${newFrame1Opacity}`);
    }

    if (parseFloat(frame5Opacity) > 0) {
      console.log(`✅ Frame 5 correctly faded in. Opacity: ${frame5Opacity}`);
    } else {
      console.error(`❌ Frame 5 did not fade in, opacity is: ${frame5Opacity}`);
    }

    // TEST 4: Navbar Dark Background Trigger
    console.log('\n5. Testing Navbar Dark Trigger...');
    const header = page.locator('#main-header');
    
    // Check before deep scroll
    let headerClass = await header.getAttribute('class');
    if (!headerClass.includes('bg-neutral-950')) {
      console.log('✅ Navbar is currently transparent (correct).');
    }

    // TEST 5: Animasi Pemanis Initial State
    console.log('\n6. Testing Pemanis Scroll Reveal Animations (Initial)...');
    const pemanisLocator = page.locator('.animasi-pemanis').nth(0);
    let pemanisClasses = await pemanisLocator.getAttribute('class');
    if (pemanisClasses.includes('opacity-0') && pemanisClasses.includes('translate-y-12')) {
      console.log('✅ Pemanis elements are correctly hidden initially.');
    } else {
      console.error('❌ Pemanis elements are NOT hidden initially. Classes:', pemanisClasses);
    }

    // Scroll to end of parallax wrapper (approx 600vh = 4800px)
    console.log('\nScrolling down past the 600vh wrapper...');
    await page.mouse.wheel(0, 5000);
    await page.waitForTimeout(1000); // Wait for JS listener
    await page.mouse.wheel(0, 1000); // Scroll down a bit more to ensure cards enter viewport
    await page.waitForTimeout(1000); 

    headerClass = await header.getAttribute('class');
    if (headerClass.includes('bg-neutral-950')) {
      console.log('✅ Navbar successfully turned dark on deep scroll!');
    } else {
      console.error('❌ Navbar did NOT turn dark. Current classes:', headerClass);
    }

    // TEST 6: Animasi Pemanis Revealed State
    pemanisClasses = await pemanisLocator.getAttribute('class');
    if (pemanisClasses.includes('opacity-100') && pemanisClasses.includes('translate-y-0')) {
      console.log('✅ Pemanis elements correctly revealed on deep scroll.');
    } else {
      console.error('❌ Pemanis elements did NOT reveal on deep scroll. Classes:', pemanisClasses);
    }

  } catch (err) {
    console.error('\n❌ Test failed with an error:', err);
  } finally {
    console.log('\n🎉 Tests completed. Closing browser...');
    await browser.close();
  }
})();
