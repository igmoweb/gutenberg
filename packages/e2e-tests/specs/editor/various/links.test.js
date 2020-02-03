/**
 * WordPress dependencies
 */
import {
	clickBlockAppender,
	clickBlockToolbarButton,
	getEditedPostContent,
	createNewPost,
	pressKeyWithModifier,
} from '@wordpress/e2e-test-utils';

/**
 * The modifier keys needed to invoke a 'select the next word' keyboard shortcut.
 *
 * @type {string}
 */

describe( 'Links', () => {
	beforeEach( async () => {
		await createNewPost();
	} );

	const waitForAutoFocus = async () => {
		await page.waitForFunction(
			() => !! document.activeElement.closest( '.block-editor-url-input' )
		);
	};

	it( 'can be created by selecting text and clicking Link', async () => {
		// Create a block with some text
		await clickBlockAppender();
		await page.keyboard.type( 'This is Gutenberg' );

		// Select some text
		await pressKeyWithModifier( 'shiftAlt', 'ArrowLeft' );

		// Click on the Link button
		await page.click( 'button[aria-label="Link"]' );

		// Wait for the URL field to auto-focus
		await waitForAutoFocus();

		// Type a URL
		await page.keyboard.type( 'https://wordpress.org/gutenberg' );

		// Submit the link
		await page.keyboard.press( 'Enter' );

		// The link should have been inserted
		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	it( 'can be created by selecting text and using keyboard shortcuts', async () => {
		// Create a block with some text
		await clickBlockAppender();
		await page.keyboard.type( 'This is Gutenberg' );

		// Select some text
		await pressKeyWithModifier( 'shiftAlt', 'ArrowLeft' );

		// Press Cmd+K to insert a link
		await pressKeyWithModifier( 'primary', 'K' );

		// Wait for the URL field to auto-focus
		await waitForAutoFocus();

		// Type a URL
		await page.keyboard.type( 'https://wordpress.org/gutenberg' );

		// Press Enter to apply the link
		await page.keyboard.press( 'Enter' );

		// The link should have been inserted
		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	it( 'can be created without any text selected', async () => {
		// Create a block with some text
		await clickBlockAppender();
		await page.keyboard.type( 'This is Gutenberg: ' );

		// Press Cmd+K to insert a link
		await pressKeyWithModifier( 'primary', 'K' );

		// Wait for the URL field to auto-focus
		await waitForAutoFocus();

		// Type a URL
		await page.keyboard.type( 'https://wordpress.org/gutenberg' );

		// Press Enter to apply the link
		await page.keyboard.press( 'Enter' );

		// A link with the URL as its text should have been inserted
		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	it( 'can be created instantly when a URL is selected', async () => {
		// Create a block with some text
		await clickBlockAppender();
		await page.keyboard.type(
			'This is Gutenberg: https://wordpress.org/gutenberg'
		);

		// Select the URL
		await pressKeyWithModifier( 'shiftAlt', 'ArrowLeft' );
		await pressKeyWithModifier( 'shiftAlt', 'ArrowLeft' );
		await pressKeyWithModifier( 'shiftAlt', 'ArrowLeft' );
		await pressKeyWithModifier( 'shiftAlt', 'ArrowLeft' );

		// Click on the Link button
		await page.click( 'button[aria-label="Link"]' );

		// A link with the selected URL as its href should have been inserted
		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	it( 'is not created when we click away from the link input', async () => {
		// Create a block with some text
		await clickBlockAppender();
		await page.keyboard.type( 'This is Gutenberg' );

		// Select some text
		await pressKeyWithModifier( 'shiftAlt', 'ArrowLeft' );

		// Click on the Link button
		await page.click( 'button[aria-label="Link"]' );

		// Wait for the URL field to auto-focus
		await waitForAutoFocus();

		// Type a URL
		await page.keyboard.type( 'https://wordpress.org/gutenberg' );

		// Click somewhere else - it doesn't really matter where
		await page.click( '.editor-post-title' );
	} );

	const createAndReselectLink = async () => {
		// Create a block with some text
		await clickBlockAppender();
		await page.keyboard.type( 'This is Gutenberg' );

		// Select some text
		await pressKeyWithModifier( 'shiftAlt', 'ArrowLeft' );

		// Click on the Link button
		await page.click( 'button[aria-label="Link"]' );

		// Wait for the URL field to auto-focus
		await waitForAutoFocus();

		// Type a URL
		await page.keyboard.type( 'https://wordpress.org/gutenberg' );

		// Click on the Submit button
		await page.keyboard.press( 'Enter' );
	};

	it( 'can be edited', async () => {
		await createAndReselectLink();

		// Click on the Edit button
		const [ editButton ] = await page.$x( '//button[text()="Edit"]' );
		await editButton.click();

		// Wait for the URL field to auto-focus
		await waitForAutoFocus();

		// Change the URL
		await page.keyboard.type( '/handbook' );

		// Submit the link
		await page.keyboard.press( 'Enter' );

		// The link should have been updated
		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	it( 'can be removed', async () => {
		await createAndReselectLink();

		// Click on the Unlink button
		await page.click( 'button[aria-label="Unlink"]' );

		// The link should have been removed
		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	const toggleFixedToolbar = async ( isFixed ) => {
		await page.evaluate( ( _isFixed ) => {
			const { select, dispatch } = wp.data;
			const isCurrentlyFixed = select( 'core/edit-post' ).isFeatureActive(
				'fixedToolbar'
			);
			if ( isCurrentlyFixed !== _isFixed ) {
				dispatch( 'core/edit-post' ).toggleFeature( 'fixedToolbar' );
			}
		}, isFixed );
	};

	it( 'allows Left to be pressed during creation when the toolbar is fixed to top', async () => {
		await toggleFixedToolbar( true );

		await clickBlockAppender();
		await page.keyboard.type( 'Text' );
		await page.click( 'button[aria-label="Link"]' );

		// Typing "left" should not close the dialog
		await page.keyboard.press( 'ArrowLeft' );
		let popover = await page.$(
			'.components-popover__content .block-editor-link-control'
		);
		expect( popover ).not.toBeNull();

		// Escape should close the dialog still.
		await page.keyboard.press( 'Escape' );
		popover = await page.$(
			'.components-popover__content .block-editor-link-control'
		);
		expect( popover ).toBeNull();
	} );

	it( 'allows Left to be pressed during creation in "Docked Toolbar" mode', async () => {
		await toggleFixedToolbar( false );

		await clickBlockAppender();
		await page.keyboard.type( 'Text' );

		await clickBlockToolbarButton( 'Link' );

		// Typing "left" should not close the dialog
		await page.keyboard.press( 'ArrowLeft' );
		let popover = await page.$(
			'.components-popover__content .block-editor-link-control'
		);
		expect( popover ).not.toBeNull();

		// Escape should close the dialog still.
		await page.keyboard.press( 'Escape' );
		popover = await page.$(
			'.components-popover__content .block-editor-link-control'
		);
		expect( popover ).toBeNull();
	} );

	it( 'can be edited with collapsed selection', async () => {
		await createAndReselectLink();
		// Make a collapsed selection inside the link
		await page.keyboard.press( 'ArrowLeft' );
		await page.keyboard.press( 'ArrowRight' );
		// Move the mouse to show the block toolbar
		await page.mouse.move( 0, 0 );
		await page.mouse.move( 10, 10 );
		const [ editButton ] = await page.$x( '//button[text()="Edit"]' );
		await editButton.click();
		await waitForAutoFocus();
		await page.keyboard.type( '/handbook' );
		await page.keyboard.press( 'Enter' );
		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	const createPostWithTitle = async ( titleText ) => {
		await createNewPost();
		await page.type( '.editor-post-title__input', titleText );
		await page.click( '.editor-post-publish-panel__toggle' );

		// Disable reason: Wait for the animation to complete, since otherwise the
		// click attempt may occur at the wrong point.
		// eslint-disable-next-line no-restricted-syntax
		await page.waitFor( 100 );

		// Publish the post
		await page.click( '.editor-post-publish-button' );

		// Return the URL of the new post
		await page.waitForSelector(
			'.post-publish-panel__postpublish-post-address input'
		);
		return page.evaluate(
			() =>
				document.querySelector(
					'.post-publish-panel__postpublish-post-address input'
				).value
		);
	};

	it( 'allows use of escape key to dismiss the url popover', async () => {
		const titleText = 'Test post escape';
		await createPostWithTitle( titleText );

		await createNewPost();
		await clickBlockAppender();

		// Now in a new post and try to create a link from an autocomplete suggestion using the keyboard.
		await page.keyboard.type( 'This is Gutenberg' );
		await pressKeyWithModifier( 'shiftAlt', 'ArrowLeft' );

		// Press Cmd+K to insert a link
		await pressKeyWithModifier( 'primary', 'K' );

		// Wait for the URL field to auto-focus
		await waitForAutoFocus();
		expect(
			await page.$(
				'.components-popover__content .block-editor-link-control'
			)
		).not.toBeNull();

		// Trigger the autocomplete suggestion list and select the first suggestion.
		await page.keyboard.type( titleText );
		await page.waitForSelector( '.block-editor-link-control__search-item' );
		await page.keyboard.press( 'ArrowDown' );

		// Expect the the escape key to dismiss the popover when the autocomplete suggestion list is open.
		await page.keyboard.press( 'Escape' );
		expect(
			await page.$(
				'.components-popover__content .block-editor-link-control'
			)
		).toBeNull();

		// Press Cmd+K to insert a link
		await pressKeyWithModifier( 'primary', 'K' );

		// Wait for the URL field to auto-focus
		await waitForAutoFocus();
		expect(
			await page.$(
				'.components-popover__content .block-editor-link-control'
			)
		).not.toBeNull();

		// Expect the the escape key to dismiss the popover normally.
		await page.keyboard.press( 'Escape' );
		expect(
			await page.$(
				'.components-popover__content .block-editor-link-control'
			)
		).toBeNull();

		// Press Cmd+K to insert a link
		await pressKeyWithModifier( 'primary', 'K' );

		// Wait for the URL field to auto-focus
		await waitForAutoFocus();
		expect(
			await page.$(
				'.components-popover__content .block-editor-link-control'
			)
		).not.toBeNull();

		// Tab to the settings icon button.
		await page.keyboard.press( 'Tab' );
		await page.keyboard.press( 'Tab' );

		// Expect the the escape key to dismiss the popover normally.
		await page.keyboard.press( 'Escape' );
		expect(
			await page.$(
				'.components-popover__content .block-editor-link-control'
			)
		).toBeNull();
	} );

	it( 'can be modified using the keyboard once a link has been set', async () => {
		const URL = 'https://wordpress.org/gutenberg';

		// Create a block with some text and format it as a link.
		await clickBlockAppender();
		await page.keyboard.type( 'This is Gutenberg' );
		await pressKeyWithModifier( 'shiftAlt', 'ArrowLeft' );
		await pressKeyWithModifier( 'primary', 'K' );
		await waitForAutoFocus();
		await page.keyboard.type( URL );
		await page.keyboard.press( 'Enter' );

		// Deselect the link text by moving the caret to the end of the line
		// and the link popover should not be displayed.
		await page.keyboard.press( 'End' );
		expect(
			await page.$(
				'.components-popover__content .block-editor-link-control'
			)
		).toBeNull();

		// Move the caret back into the link text and the link popover
		// should be displayed.
		await page.keyboard.press( 'ArrowLeft' );
		expect(
			await page.$(
				'.components-popover__content .block-editor-link-control'
			)
		).not.toBeNull();

		// Press Cmd+K to edit the link and the url-input should become
		// focused with the value previously inserted.
		await pressKeyWithModifier( 'primary', 'K' );
		await page.waitForSelector(
			':focus.block-editor-link-control__search-item-title'
		);
		await page.keyboard.press( 'Tab' ); // Shift focus to "Edit" button
		await page.keyboard.press( 'Enter' ); // Click "Edit" button

		await waitForAutoFocus();
		const activeElementParentClasses = await page.evaluate( () =>
			Object.values(
				document.activeElement.parentElement.parentElement.classList
			)
		);
		expect( activeElementParentClasses ).toContain(
			'block-editor-url-input'
		);
		const activeElementValue = await page.evaluate(
			() => document.activeElement.value
		);
		expect( activeElementValue ).toBe( URL );
	} );

	it( 'adds an assertive message for screenreader users when an invalid link is set', async () => {
		await clickBlockAppender();
		await page.keyboard.type( 'This is Gutenberg' );
		await pressKeyWithModifier( 'shiftAlt', 'ArrowLeft' );
		await pressKeyWithModifier( 'primary', 'K' );
		await waitForAutoFocus();
		await page.keyboard.type( 'http://#test.com' );
		await page.keyboard.press( 'Enter' );
		const assertiveContent = await page.evaluate(
			() => document.querySelector( '#a11y-speak-assertive' ).textContent
		);
		expect( assertiveContent.trim() ).toBe(
			'Warning: the link has been inserted but may have errors. Please test it.'
		);
	} );

	it( 'should contain a label when it should open in a new tab', async () => {
		await clickBlockAppender();
		await page.keyboard.type( 'This is WordPress' );
		// Select "WordPress".
		await pressKeyWithModifier( 'shiftAlt', 'ArrowLeft' );
		await pressKeyWithModifier( 'primary', 'k' );
		await waitForAutoFocus();
		await page.keyboard.type( 'w.org' );

		// Insert the link
		await page.keyboard.press( 'Enter' );

		// Navigate back to the popover
		await pressKeyWithModifier( 'primary', 'k' );
		await page.waitForSelector(
			'.components-popover__content .block-editor-link-control'
		);

		// Navigate to the "Open in New Tab" checkbox.
		await page.keyboard.press( 'Tab' );
		await page.keyboard.press( 'Tab' );

		// Check the checkbox.
		await page.keyboard.press( 'Space' );

		expect( await getEditedPostContent() ).toMatchSnapshot();

		// Regression Test: This verifies that the UI is updated according to
		// the expected changed values, where previously the value could have
		// fallen out of sync with how the UI is displayed (specifically for
		// collapsed selections).
		//
		// See: https://github.com/WordPress/gutenberg/pull/15573

		// Collapse selection.
		await page.keyboard.press( 'ArrowLeft' );
		await page.keyboard.press( 'ArrowRight' );
		// Edit link.
		await pressKeyWithModifier( 'primary', 'k' );
		await page.waitForSelector(
			':focus.block-editor-link-control__search-item-title'
		);
		await page.keyboard.press( 'Tab' ); // Shift focus to "Edit" button
		await page.keyboard.press( 'Enter' ); // Click "Edit" button
		await waitForAutoFocus();
		await pressKeyWithModifier( 'primary', 'a' );
		await page.keyboard.type( 'wordpress.org' );

		// Update the link
		await page.keyboard.press( 'Enter' );

		// Navigate back to the popover
		await pressKeyWithModifier( 'primary', 'k' );
		await page.waitForSelector(
			'.components-popover__content .block-editor-link-control'
		);

		// Navigate to the "Open in New Tab" checkbox.
		await page.keyboard.press( 'Tab' );
		await page.keyboard.press( 'Tab' );
		// Uncheck the checkbox.
		await page.keyboard.press( 'Space' );

		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );
} );