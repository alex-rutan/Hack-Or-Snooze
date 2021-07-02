"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;
let newStory;


/** Handle story form submission. */

// OUTSTANDING QUESTIONS: WHY IS THERE A DELAY LAG WHEN SUBMITTING NEW STORY (ONLY LOADS AFTER REFRESH) AND DO WE NEED AWAIT IN FRONT OF putStoriesOnPage() ???
async function submitStory(evt) {
  console.debug("submitStory", evt);
  evt.preventDefault();

  const author = $("#author").val();
  const title = $("#title").val();
  const url = $("#url").val();

  // const story = { author, title, url }

  // StoryList.addStory sends Post request to API and returns story instance
  // which we'll make the globally-available newStory.
  newStory = await storyList.addStory(currentUser, { author, title, url });
  // newStory = { author: "Me", title: "TEST5", url: "http://meow.com" }

  await putStoriesOnPage(); // !!!!!!! DO WE NEED AWAIT HERE???

  $storySubmitForm.trigger("reset");
  $storySubmitForm.hide();
}

$storySubmitForm.on("submit", submitStory);


/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}
