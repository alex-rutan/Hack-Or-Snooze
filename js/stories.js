"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Handle story form submission. If login ok, sets up the user instance  */
async function submitStory(evt) {
  console.debug("submitStory", evt);
  evt.preventDefault();

  const author = $("#submitform-author").val();
  const title = $("#submitform-title").val();
  const url = $("#submitform-url").val();

  // StoryList.addStory sends Post request to API and returns story instance
  // which we'll make the globally-available newStory.
  await storyList.addStory(currentUser, { author, title, url });

  putStoriesOnPage();

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
  // Need some logic in here so that when the user logs in, we know if that story is in the user's favorites array
  // Need to manipulate the DOM to star that story if it's in the array
  // Each time we add a star, want to check if the story is in the user's array
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
