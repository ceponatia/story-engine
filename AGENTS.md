# Story Engine

## Codex Role

This is an LLM-powered roleplaying game powered by Ollama and Mistral models.
It runs on Nextjs with Typescript and Tailwindcss.
Drizzle-ORM is used to migrate changes to supabase.

Your goal is to develop this app with input from the user (project manager).

## Site Design

IMPORTANT: Always create new functionality as a component or utility when possible to facilitate reusability and modularization.

### Style

Using Tailwindcss, the color theme and buttons for the site will match a dark, romantic style with deep violets and neon colors.

### Important Components

- Landing page: The landing page of the app will have buttons for "Login" and "Register" in the center of the page if a session token / cookie is not found. If the user is logged in (token / cookie found) the buttons will instead say "Dashboard" and "Start Adventure".
- Header: The header will be a thin bar (1-row) across the top of all pages and will display "StoryEngine" in the left side and a collapsing hamburger navigation menu on the right side.
  - Navigation Menu: When clicking the hamburger menu, buttons will be arranged vertcally and will display "Home", "New Adventure", "Continue Adventure", "Library", "Documentation", "About", a horizontal dividier, "Login",      "Register". "Login" and "Register" will change to "Dashboard" and "Sign Out" when the user is already signed in. Clicking the login and register buttons will bring up a modal in the middle of the screen for either           logging in or resistering. Clicking anywhere that IS NOT a button on the menu will collapse the menu for better UX.
    - Login modal: This modal will use Supabase Auth to log the user in. It will have an Email field and a password field. There will be a "Log In" and "Cancel" button on the modal.
    - Register modal: This modal will register a new user with Supabase Auth. It will have fields for First Name, Last Name, Email Address, Username, Password, Confirm Password, and buttons for "Register" and "Cancel".
    - Library: The library button will not be a hyperlink unlike the other buttons. Instead, clicking "Library" will reveal three new buttons below it: Characters, Settings, and Locations. These are individual libraries.        The "Library" button is collapsible, allowing users to show the three library pages and hide them. They are hidden by default.
- Library Pages: These are accessed via the "Library" collapsing menu in the navigation bar. All three libraries will use the same template but will reference different [id] information. Users can only see PUBLIC cards or cards OWNED by them. All cards are public by default but in the creation screen, users can toggle them to private. Cards follow this design: the card's "image" is the background of the card which fades down in a gradient to a background color. The bottom of the card contains the "Name" field and below that the "Description" field. Below those two fiels are tag icons which are different colored rounded boxes with the tag text in them. Clicking these tags filters the card library by that tag.
    - Characters: A card library of characters. The card display is 3 columns wide and scrolls vertically when there are more than 2 rows of cards. This is a flexbox within the app page. Each card links to a specific page         for a character record. There is a "Create New Character" button in the upper right above the flexbox.
    - Settings: Same as characters, but is linked to library cards. Each card links to a specific page for a setting record. There is a "Create New Setting" button in the upper right above the flexbox.
    - Locations: Same as characters, but is linked to location cards. Each card links to a specific page for a location record. There is a "Create New Location" button in the upper right above the flexbox.
- Create Character: This is the template page for creating new characters. The fields are stored in a characters table which will be used by the LLM to extract prompt instructions. There is a hidden field of "CreatedBy" which is the user's id field. The fields are as follows:
  - Name (120-character limit field)
  - Age (numeric, 4-digit limit)
  - Gender (dropdown with Male, Female, Other, Unknown)
  - Tags (Can free-text new tags or select from preexisting options which autofill as the person types. When a NEW tag is added, it is saved to the character-tags table).
  - Avatar (Image upload field by browsing for files or dragging and dropping. No more than 5mb. Will be shrunk/compressed by server this is the image that appears on character cards so it must be formatted to fit the card size. The site should be able to scale it up / down and crop the sides as cards will be taller than they are wide).
  - Appearance (Text box with no character limit. Fixed size but scrollable)
  - Scents & Fragrances (Same as appearance)
  - Personality (Same as appearance)
  - Background (Same as appearance)

## To-Do
- Flesh out Supabase integration for library and character creation forms.
- Implement login and register modals as described in the navigation menu.
- Style card libraries with tag filtering and gradient image backgrounds.
- Provide `.env.example` with Supabase configuration variables.
- Create responsive library card container and card components for dating-app style layout.
- Organize library components into a subfolder to keep the root components directory clean.
