# Food Recommendation App — Brainstorm

## Core Idea

A personalized food recommendation system inspired by Spotify's recommendation experience.

The goal is to help users answer:

> **"What should I eat?"**

rather than simply:

> **"Where can I eat?"**

The system learns a user's food preferences over time and recommends specific dishes, restaurants, and new foods that are likely to match their taste.

---

## Key Differentiator

### Recommend dishes, not just restaurants

Instead of saying:

- "Here are 10 restaurants near you."

The app could say:

- "You'd probably like the chicken tikka masala at this restaurant."
- "You liked butter chicken, so you may enjoy this dish."
- "This ramen is probably a good match for your preference for spicy, savory food."

The recommendation should be personalized to the individual.

---

## Taste Profile

Build a dynamic user taste profile rather than relying entirely on a questionnaire.

Potential preference dimensions:

- Cuisines
- Specific dishes
- Ingredients
- Spice tolerance
- Sweet/savory preference
- Rich/light foods
- Creamy/crunchy textures
- Smoky/tangy/sour flavors
- Vegetarian/non-vegetarian preferences
- Dietary restrictions
- Allergies
- Price range
- Portion preferences
- Restaurant distance
- Willingness to try new foods
- Familiarity vs. novelty

The profile should evolve based on user behavior.

---

## Minimize User Effort

Users are unlikely to complete a long food-preference questionnaire.

Instead, learn preferences implicitly from:

- Searches
- Clicks
- Saved dishes
- Likes/dislikes
- Ratings
- Restaurants visited
- Dishes viewed
- Recommendations accepted/rejected
- Repeat orders
- Search history
- Location/context
- Time of day

The system can occasionally ask lightweight questions when useful.

Example:

> "You seem to like spicy Indian food. Want me to make your recommendations spicier?"

---

## Core User Experience

### First Visit

Give the user value immediately.

Example:

1. Ask for location.
2. Ask what they feel like eating, or allow free-form input.
3. Show personalized recommendations.
4. Let the user interact with the recommendations.
5. Use those interactions to begin learning their preferences.

Avoid forcing account creation or a long onboarding process before demonstrating value.

---

## Natural Language Input

Allow users to describe what they want naturally.

Examples:

- "I want something spicy."
- "I'm craving Indian food."
- "I want something like butter chicken but lighter."
- "Find me something cheap nearby."
- "I want something new."
- "I'm tired and want comfort food."
- "Give me something healthy but filling."
- "I want tacos but not too spicy."

The system converts this into structured preferences and recommendation criteria.

---

## Recommendation Types

### Personalized Recommendations

"What should I eat?"

### Nearby Recommendations

"What should I eat near me?"

### Dish-Level Recommendations

"What should I order at this restaurant?"

### Discovery

"Recommend something I've never tried."

### Similar Foods

"I liked X. What else would I like?"

### Contextual Recommendations

Recommendations based on:

- Time
- Location
- Weather
- Budget
- Meal type
- Mood
- Previous choices

---

## Taste Graph

Potential long-term differentiator: represent foods through a structured flavor/taste graph.

For example:

**Butter Chicken**

- Indian
- Creamy
- Tomato-based
- Rich
- Mild/medium spice
- Savory
- Chicken
- Comfort food

A user who likes butter chicken may therefore receive recommendations for foods sharing some of these characteristics.

This could allow recommendations beyond simple cuisine-based filtering.

---

## Recommendation Explanation

Every recommendation could explain why it was selected.

Example:

> **Chicken Shawarma — 87% match**
>
> You liked chicken tikka and garlic naan. This has a similar savory/spiced profile but is lighter.

This makes the recommendation system feel intelligent and builds user trust.

---

## Social / Engagement Ideas

Potential features:

- Rate dishes
- Save dishes
- Personal food diary
- "Foods I've tried"
- Friends' recommendations
- Share a dish
- Follow users
- Taste-profile comparison
- "Your food personality"
- Weekly food discoveries

These should be secondary to the recommendation experience.

---

## Potential MVP

Keep the first version simple.

### MVP Features

- User account
- Location
- Natural-language food search
- Restaurant/dish database
- Basic taste profile
- Dish-level recommendations
- Like/dislike/save
- Recommendation explanations
- Simple recommendation history

### Avoid Initially

- Complex social network
- Food delivery
- Full restaurant reservation system
- Excessive gamification
- Huge questionnaire
- Overly complicated UI

---

## Technical Direction

Potential stack:

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

### Backend

- FastAPI / Python

or

- Next.js API routes

### Database

- PostgreSQL
- pgvector

### AI / ML

Potential components:

- Embeddings
- LLM-based preference extraction
- Semantic search
- Hybrid recommendation
- Collaborative filtering
- Content-based recommendation
- Reranking
- LLM-generated recommendation explanations

### Deployment

Possible setup:

- Vercel — frontend / Next.js
- Railway / Render / similar — backend
- PostgreSQL + pgvector — database
- External restaurant/place APIs — restaurant and location data

---

## Recommendation Architecture

Possible pipeline:

1. User submits query or interacts with app.
2. Extract intent and preferences.
3. Retrieve candidate dishes/restaurants.
4. Filter based on hard constraints.
5. Generate semantic similarity scores.
6. Apply user taste profile.
7. Apply contextual factors.
8. Rank candidates.
9. Generate explanation.
10. Display recommendations.
11. Capture user feedback.
12. Update taste profile.

---

## Example

User profile:

- Likes Indian food
- Likes chicken
- Medium spice tolerance
- Likes creamy dishes
- Likes biryani
- Likes butter chicken
- Budget: $$

User asks:

> "I want something different tonight."

System might recommend:

**Chicken Korma**

Why:

- Similar richness to butter chicken
- Mild-to-medium spice
- Chicken-based
- Indian
- Different enough to provide novelty

The system could also include:

**Novelty: 7/10**

**Taste Match: 91%**

---

## Potential Resume Value

This project could demonstrate:

- Recommendation systems
- Machine learning
- LLM applications
- Embeddings
- Vector databases
- Semantic search
- RAG/hybrid retrieval
- Personalization
- Full-stack development
- API integration
- Database design
- Cloud deployment
- Product thinking

A strong version of the project should demonstrate that the recommendation quality improves as the system learns from user interactions.

---

## Product Question

The biggest product question is not:

> "Can I build a recommendation algorithm?"

It is:

> **"Why would someone come back and use this instead of Google Maps, Yelp, DoorDash, or asking ChatGPT?"**

The product needs a recurring value loop.

Possible loop:

**Discover → Try → Rate → Learn → Better recommendations → Discover again**

---

## Potential Differentiation

Potential positioning:

1. **Dish-first recommendations**
2. **Personal taste profile**
3. **Flavor/taste graph**
4. **Recommendations that improve with usage**
5. **Natural-language food discovery**
6. **Personalized explanations**
7. **Discovery of unfamiliar foods**
8. **Context-aware recommendations**

The strongest combination is likely:

> **A personal food recommendation engine that learns your taste and tells you exactly what dish you should try next.**

---

## Future Ideas

- AI food concierge
- Voice-based food discovery
- Camera/menu scanning
- Import restaurant/order history
- Personalized food map
- "Spotify Wrapped" for food
- Weekly personalized food discoveries
- Taste evolution over time
- Restaurant menu intelligence
- Friend taste matching
- Group recommendations
- Travel food recommendations
- Personalized food itineraries

---

## Open Questions

- Where will dish-level restaurant data come from?
- How accurately can dish ingredients/flavor profiles be inferred?
- How much data is needed before recommendations become useful?
- Should recommendations be restaurant-first or dish-first?
- How should cold-start users be handled?
- How should allergies and dietary restrictions be treated?
- How should novelty be balanced against familiarity?
- How should recommendation quality be evaluated?
- What makes the product sufficiently different from Google Maps/Yelp/DoorDash?
- What is the smallest MVP that proves people actually want this?
