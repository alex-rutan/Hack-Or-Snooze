"use strict";

const BASE_URL = "https://hack-or-snooze-v3.herokuapp.com";

/******************************************************************************
 * Story: a single story in the system
 */

class Story {

  /** Make instance of Story from data object about story:
   *   - {title, author, url, username, storyId, createdAt}
   */

  constructor({ storyId, title, author, url, username, createdAt }) {
    this.storyId = storyId;
    this.title = title;
    this.author = author;
    this.url = url;
    this.username = username;
    this.createdAt = createdAt;
    this.favorite = false;
  }

  /** Parses hostname out of URL and returns it. */

  getHostName() {
    // UNIMPLEMENTED: complete this function!
    return new URL(this.url).hostname;
  }
}


/******************************************************************************
 * List of Story instances: used by UI to show story lists in DOM.
 */

class StoryList {
  constructor(stories) {
    this.stories = stories;
  }

  /** Generate a new StoryList. It:
   *
   *  - calls the API
   *  - builds an array of Story instances
   *  - makes a single StoryList instance out of that
   *  - returns the StoryList instance.
   */

  static async getStories() {
    // Note presence of `static` keyword: this indicates that getStories is
    //  **not** an instance method. Rather, it is a method that is called on the
    //  class directly. Why doesn't it make sense for getStories to be an
    //  instance method?
    /*  A: Since there is only one version of all the stories and it does not need to 
        replicated, it doesn't make sense to have different instances replicating
        it. It's static. */

    // query the /stories endpoint (no auth required)
    const response = await axios({
      url: `${BASE_URL}/stories`,
      method: "GET",
    });

    // turn plain old story objects from API into instances of Story class
    const stories = response.data.stories.map(story => new Story(story));

    // build an instance of our own class using the new array of stories
    return new this(stories); // Comment: this seems to be working
  }


  /** Adds story data to API, makes a Story instance, adds it to story list.
   * - user - the current instance of User who will post the story
   * - obj of {title, author, url}
   *
   * Returns the new Story instance
   */
  async addStory(currentUser, newStory) {

    const { loginToken } = currentUser;
    const { author, title, url } = newStory;

    const response = await axios({
      url: `${BASE_URL}/stories`,
      method: "POST",
      data: { token: loginToken, story: { author, title, url } },
    });

    {
      const { storyId, title, author, url, username, createdAt } = response.data.story;

      const story = new Story(
        {
          storyId,
          title,
          author,
          url,
          username,
          createdAt
        }
      );
      this.stories.unshift(story); 
      
      return story;
    }
  }
}


/******************************************************************************
 * User: a user in the system (only used to represent the current user)
 */

class User {
  /** Make user instance from obj of user data and a token:
   *   - {username, name, createdAt, favorites[], ownStories[]}
   *   - token
   */

  constructor({
    username,
    name,
    createdAt,
    favorites = [],
    ownStories = []
  },
    token) {
    this.username = username;
    this.name = name;
    this.createdAt = createdAt;

    // instantiate Story instances for the user's favorites and ownStories
    this.favorites = favorites.map(s => new Story(s));

  // This is duplicate logic. We can keep track of favorites in the user instance and just manipulate the DOM rather
  // than keeping track in the Story class.
  // In the constructor, we get the incoming favorites and just add to the DOM 
  // for (let story of currentUser.favorites) {
  //   story.favorite = true;
  // }    

    this.ownStories = ownStories.map(s => new Story(s));

    // store the login token on the user so it's easy to find for API calls.
    this.loginToken = token;
  }

  /** Register new user in API, make User instance & return it.
   *
   * - username: a new username
   * - password: a new password
   * - name: the user's full name
   */

  static async signup(username, password, name) {
    const response = await axios({
      url: `${BASE_URL}/signup`,
      method: "POST",
      data: { user: { username, password, name } },
    });

    /** Defines user variable */
    let { user } = response.data;

    return new this(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      response.data.token
    );
  }

  /** Login in user with API, make User instance & return it.
​
   * - username: an existing user's username
   * - password: an existing user's password
   */

  static async login(username, password) {
    const response = await axios({
      url: `${BASE_URL}/login`,
      method: "POST",
      data: { user: { username, password } },
    });

    let { user } = response.data;

    return new this(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      response.data.token
    );
  }

  /** When we already have credentials (token & username) for a user,
   *   we can log them in automatically. This function does that.
   */

  static async loginViaStoredCredentials(token, username) {
    try {
      const response = await axios({
        url: `${BASE_URL}/users/${username}`,
        method: "GET",
        params: { token },
      });

      let { user } = response.data;

      return new this(
        {
          username: user.username,
          name: user.name,
          createdAt: user.createdAt,
          favorites: user.favorites,
          ownStories: user.stories
        },
        token
      );
    } catch (err) {
      console.error("loginViaStoredCredentials failed", err);
      return null;
    }
  }

  async addFavorite(story) {
    // TO DO: go into insomnia and see how favorites API calls work

    /*
    Generate markup (stories) ... HTML
    Load the page without logging, no stars
    As soon as someone logs in, all stars show up (depending on if user has stories in user's favorites arrays)
    Figure out how to click on favorites and toggle
    Update user's favorites list depending on click
      Update in local memory (locally... added to list) and update in API (POST requests)
    */

    // Scan favorites and star

    // Still need the axios request, just not updating the favorite
    
    story.favorite = true; // delete this

    // const { loginToken } = currentUser;
    const { storyId } = story; // delete this

    // TODO: Also try with storyId not deconstructed
    // outstanding Q: do we need to deconstruct (i) just favorite, (ii) maybe storyId & favorite, or (iii) all properties?
    const response = await axios({
      url: `${BASE_URL}/users/${currentUser}/favorites/${storyId}`,
      method: "POST",
      data: { "token": this.token, username: currentUser.username, storyId: storyId },
    });

    /* outstanding Q: is it better to call putStoriesOnPage or use array methods (e.g. find) to 
    find element that matches the storyId of the story favorited? 
    
    this.stories.findIndex(el => el[storyId]).... 
    */
    this.favorites.unshift(story);

    putStoriesOnPage();
    // better to use putStoriesOnPage but conditionally decide if we want to add to star.... 
      // whenever generate a story, if currentUser === undefined, no star....
      // if not undefined, then add stars
  }


  async removeFavorite(story) {
    story.favorite = false; // delete this

    // const { loginToken } = currentUser;
    const { storyId } = story; // delete this

    // TODO: Also try with storyId not deconstructed
    // outstanding Qs: same as addFav...
    const response = await axios({
      url: `${BASE_URL}/users/${currentUser}/favorites/${storyId}`,
      method: "POST",
      data: { "token": this.token },
    });

    this.favorites.unshift(story); // TODO: use filter to match

    putStoriesOnPage();
  }
}

/*
  async addStory(currentUser, newStory) {

    const { loginToken } = currentUser;
    const { author, title, url } = newStory;

    const response = await axios({
      url: `${BASE_URL}/stories`,
      method: "POST",
      data: { token: loginToken, story: { author, title, url } },
    });

    {
      const { storyId, title, author, url, username, createdAt } = response.data.story;

      const story = new Story(
        {
          storyId,
          title,
          author,
          url,
          username,
          createdAt
        }
      );
      this.stories.unshift(story); // TODO: will need to this with favorites as well  
    }
  }
*/