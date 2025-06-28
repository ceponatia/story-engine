# Roleplaying driven by an LLM: observations & open questions

*Source: [Ian Bicking's Blog](https://ianbicking.org/blog/2024/04/roleplaying-by-llm)*

I've been making some experiments with roleplaying and LLMs (Large Language Models, such as ChatGPT). After a lot of coding I think it's time to step back and think about what I've done and what I might want to do.

This post describes techniques used to improve LLM character behavior, larger experiments made, and a long list of thoughts and questions.

## Table of Contents

1. [What is a prompt?](#what-is-a-prompt)
2. Roleplay as chat…
   - [Implementing simple chat](#implementing-simple-chat)
   - [Situated chat](#situated-chat)
   - [Activity alongside dialog](#activity-alongside-dialog)
   - [Saying goodbye](#saying-goodbye)
   - [Hallucination and memory](#hallucination-and-memory)
3. Larger world experiments…
   - [A historical experiment](#a-historical-experiment)
   - [A game mechanics experiment](#a-game-mechanics-experiment)
4. [Thoughts and open questions](#thoughts-and-open-questions)

### Terms

**Gamemaster:** the LLM role that directs the story by mediating player actions, describing how time advances, etc.  
**Feat:** Some action that is hard enough you might fail, generally requiring a roll with a random chance of failure or success

## What is a prompt?

A request to GPT is a series of messages (plus some other uninteresting parameters). Each message has a _role_, one of:
- **system** for messages from the developer to GPT
- **user** for messages from the user 
- **assistant** for messages created by GPT

Example prompt structure:
```
system: Play the part of William Shakespeare. Do not break character.
user: How is it going?
assistant: 'Tis going well, my noble friend, for my quill doth dance upon the page with words of love and longing.
user: What are you writing?
```

### Key Points About Prompts

1. If you ask GPT why it said something, it will look at the transcript and imagine why someone might have said that thing. It doesn't have access to any past thought process.
2. Everything in that prompt is under the control of the developer. The developer can put words in the assistant's mouth, leave things out, or do _anything_.
3. The last **user** prompt is very important, it's what GPT will respond to directly.
4. You don't have to maintain any history at all! You can make every request from scratch.
5. You don't have to show the user exactly what GPT returns.
6. Everything is part of the prompt: the beginning, all the intermediate messages, and the final message.

## Implementing Simple Chat

The basic progression through LLM-assisted roleplay:

The easiest thing is just to set the system prompt and chat away! This works wildly better than anything from 2022, but it's still just _OK_.

### Techniques to Improve Chat

1. **Make it collaborative dialog writing** instead of interacting directly with LLM. Use a system prompt that describes the exercise as collaborative dialog writing where the user is "writing" a character and the LLM is "writing" the other character.

2. **Include instructions on how to respond at the end of the prompt**, not just in the system prompt. Repeat the most important instructions in the beginning and end of the prompt.

3. **Generate internal dialog or an internal thought process** in addition to the normal dialog. Give the LLM room to think. This means the LLM will write "thoughts" that you won't show to the player.

4. **Summarize periodically** (replacing the older transcript with the summary) so that the context stays more limited and fresh.

5. **Think hard about what attributes you want to capture** in that summary. The summary is a chance to focus the LLM on the most interesting aspects of the conversation: conflict, attitude, notable events, forming opinions on the player character.

6. **Initialize the chat with a summary** to set the stage. Even if the summary is sparse it will help focus the LLM.

7. **Compress dialog** to remove some of the idle chatter and repetition that tends to arise, again keeping the context on-point.

## Situated Chat

All those techniques are helpful but the scenario is still weird with an entity floating in the ether until some nameless faceless entity known only as "user" comes up and says "hi".

The next step is creating a setting:
- Name and describe the player
- Create some sort of purpose to the conversation

## Activity Alongside Dialog

A quick extension is to add scene and action descriptions. Once you've set this up as a kind of collaborative writing process this is as simple as asking descriptions to go in `<description>...</description>` tags.

Now you have:
- Some action
- A setting that can be updated by keeping track of changes in descriptions
- Potentially even consequences (though vague ones)

## Saying Goodbye

If you've ever used one of these LLM chats you've probably come to the point when a conversation should end… but it can't. You can never stop talking.

It's not hard to have the LLM signal that a conversation should finish. But then what? If the player was in conversation and now they are not, then where are they? Something as simple as goodbye requires a whole world to return to.

## Hallucination and (Lack of) Memory

Retrieval Augmented Generation (RAG) is "looking up information/memories and giving them to the LLM". A RAG system includes context in the prompt based on what seems most relevant at the moment.

However, **guided summarization** is often sufficient: periodically (when the transcript gets big enough, or there's an event like a goodbye) have the LLM summarize the conversation up to that point, and then use that summary in place of the earlier transcript.

But summarization does lose details: did either character learn specific facts during the conversation? The LLM will readily hallucinate all kinds of details, but without an explicit memory it's all only as real as a dreamstate.

## A Historical Experiment

The first larger idea pursued was play-acting an entire life. In particular by roleplaying pivotal or symbolically important moments in the character's life.

### Types of Scenarios Imagined

1. **Making a life decision:** what profession to pursue, who to marry, and so on
2. **Finding what's important in your life:** politics, art, family, etc.
3. **Expressing your personality:** how you react, how you interact with others, how you respond to loss or success

This involves multiple scenarios over decades, so you have to think about the character changing… but also the world changes around the character. This leads to historical roleplay.

### Challenges with Creating Compelling Moments

- Hard to create a compelling _moment_ that is worth roleplaying
- Where the player can feel real autonomy and drive to accomplish something
- Technical problem: unlimited ability to engage in dialog, but physical actions are at best vague and dreamlike
- The freedom of dialog mirrors the real world, but we cannot physically _do_ anything we choose

### Open Questions About Scenarios

1. Am I giving the player the ability to exercise their preferred alignment via the character?
2. Does the player want to be tested? And in what way?
3. What pushback is fun? What is unwelcome?
4. If the character exemplifies something, to what degree is that something the game should do vs the player?
5. How many rules do we handle with gameplay vs narrative?
6. If the player enters text, what voice or frame is that text?

## A Game Mechanics Experiment

Taking a step back to work on something more relaxed, using an imaginary city builder as the foundation. This game included:

### Three Notable Experimental Parts

1. **Intent parsing:** separates input into dialog, intent to do an action, and a few direct commands (movement, ending conversation, inspecting something)

2. **Ability, stats, and action resolution:** the LLM determines what abilities are needed to perform an action, and at what difficulty, then dice are rolled and the LLM determines effects given success/failure results

3. **Ad hoc but updateable attributes** like inventory and injuries

### Action Resolution Process

1. **Player skills represented with natural language** such as "feeble", "weak", "strong", etc.
2. **LLM determines relevant skills** (knowledge, strength, speed, etc) and thinks about challenge level
3. **Analyze difficulty** of the action with respect to each skill (trivial, normal, difficult, very difficult, or impossible)
4. **Game rolls dice** and assigns success/failure to each skill based on roll and difficulty
5. **LLM describes results** including concrete results like gaining/losing inventory or being injured

The game notably lacks a _point_ - there are no goals, you just wander interminably. Also the world is static with limited updates.

## Thoughts and Open Questions

### Action and Resolution

1. **Distinction between feats and simple actions**
   - Should a gamemaster step always happen?
   - Prompt overhead concerns vs. optimization needs

2. **Natural language skill levels**
   - Hard to have more than 4-5 levels (feeble/weak/average/strong/powerful)
   - Big jumps between levels, hard to balance probabilities
   - Mathematical modifiers might be needed

3. **Action spam prevention**
   - Ability to spam attempts makes it too easy to eventually succeed
   - Escalating cost of failure as potential solution
   - Increasing consequentiality of all attempts

4. **Gamemaster vs Goalmaster roles**
   - Gamemaster: arbiter of immediate actions
   - Goalmaster: inspires action, arranges plot movement, revisits themes
   - Goalmaster could be specialized to different structures/genres

5. **Direct vs indirect roleplay**
   - Should player act _as_ character or describe what character should do?
   - How to play characters very different from yourself?
   - Bonus points for detailed roleplay descriptions

6. **Action description as gameplay element**
   - How you describe an action affects which skills come into play
   - Action descriptions inform how success/failure is resolved

7. **Social gameplay specificity**
   - Describing body language and attitude should affect interactions
   - Need to solicit this input from players
   - Most salient in environments with strong social rules

8. **NPC feat resolution**
   - Should NPCs function similarly to player character?
   - NPC feats offer element of surprise
   - Everything normalized to text makes same rules easy to apply

### World and Context

1. **World representation options**
   - **Full code:** data structures, custom prompts, automatic resolution
   - **Casual natural language:** guided by prompts/templates, LLM resolution
   - **Pile of words:** general purpose summaries, can be unspecified
   - **Hallucinate it all:** let LLM make up as needed without consistency
   - **Embrace incremental specificity:** start with vibes, formalize when needed

2. **Retrieval Augmented Generation (RAG)**
   - Hand-coded prompts already do a kind of RAG
   - Context really matters - must avoid confusing player with other characters
   - Determining memorable facts is big task
   - Some facts should be structured rather than relying on RAG
   - Preprocessing facts for different contexts

3. **Multiple prompts for focus**
   - Helpful for limiting information and instructions
   - Gives player and NPCs more autonomy and surprise
   - Avoids everything being visible to every interaction

4. **LLM biases and repetition**
   - LLM better at diversity when making lists vs singular answers
   - Solution: have LLM produce and draw from more lists
   - Additional prompting step needed for list-based generation

5. **Background activity**
   - World feels alive with background happenings
   - Full simulation expensive/slow/chaotic
   - Simpler roll-for-activity with predefined possibilities
   - Just-in-time background activity for repeat interactions

6. **World setup amount**
   - How much LLM works out on-the-fly vs created ahead of time
   - Setup of concrete things vs setting up rules themselves
   - LLM can invent new rules/facets/verbs during play

7. **LLM knowledge integration**
   - Sometimes feels like bug (peasant solving algebra)
   - Can roleplay personality and knowledge of characters
   - Can speak other languages, critique etiquette, etc.
   - Gets things wrong but feels less concerning in games

8. **Multi-user considerations**
   - Compelling if players can create/share world
   - Action resolution not well attached to clock
   - Race conditions with "big" moves
   - Non-synchronous play possibilities
   - Safety and prompt hacking concerns

### Interface and Interaction

1. **Text input weight**
   - Each turn can lead to blank page syndrome
   - Too much freedom can be paralyzing
   - Multiple choice vs generative input tension

2. **Game learnability**
   - Natural language input really helps vs traditional MUDs
   - LLM resolution not like traditional text adventures
   - Always doing _something_ is itself an issue

3. **Game rhythm**
   - Most obvious: one long stream of activity
   - Need summative moments for compression and effects
   - Benefits from moments of reflection and pause

4. **Mini-games concept**
   - Different prompts, goals, outcomes but shared UI elements
   - Examples: Debate, Deceit, Wandering/exploring, Scavenger hunt, Day in the life, Hard conversation, Attempt a feat, Relationship building
   - Worry this is avoidance of creating one compelling experience
   - Positive: easy to normalize to core game mechanics

5. **Jiminy Cricket character**
   - Secret companion/advisor/voice in head
   - Help system or source of goals?
   - Various pretenses: teleportation into consciousness, etc.

*[Content continues but truncated for length - the source article contains much more detail on these topics and additional sections on Player Goals/Motivation, The Medium of Gameplay, and Conclusion]*