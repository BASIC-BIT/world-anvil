/**
 * A configuration sheet FormApplication to configure the World Anvil integration
 * @extends {FormApplication}
 */
export default class WorldAnvilConfig extends FormApplication {

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "world-anvil-config",
      template: "modules/world-anvil/templates/config.html",
      width: 600,
      height: "auto",
      closeOnSubmit: false,
    });
  }

	/* -------------------------------------------- */

  /** @override */
  get title() {
    return game.i18n.localize("WA.ConfigureMenu");
  }

	/* -------------------------------------------- */

  /** @override */
  async getData() {
    const anvil = game.modules.get("world-anvil").anvil;

    // Determine the configuration step
    let stepNumber = 0;
    let stepLabel = "WA.ConfigureStep3";
    if ( !anvil.user ) {
      stepLabel = "WA.ConfigureStep1";
      stepNumber = 1;
    }
    else if ( !anvil.worldId || anvil.showOtherUserError ) {
      stepLabel = "WA.ConfigureStep2";
      stepNumber = 2;
    }
    else stepNumber = 3;

    // Maybe retrieve a list of world options
    if ( anvil.user && !anvil.worlds.length ) await anvil.getWorlds();

    console.log("anvil", "getData", anvil)
    // Return the template data for rendering
    return {
      stepLabel: stepLabel,
      displayWorldChoices: stepNumber >= 2,
      worlds: anvil.worlds,
      worldId: anvil.worldId,
      authToken: anvil.authToken,
      otherUserId: anvil.otherUserId,
      showOtherUserError: anvil.showOtherUserError,
      showAuthTokenError: anvil.showAuthTokenError,
    };
  }

	/* -------------------------------------------- */

  /** @override */
  _updateObject(event, formData) {
    formData.authToken = formData.authToken.trim();
    console.log("Form Data: ", formData);
    game.settings.set("world-anvil", "configuration", formData);
  }

	/* -------------------------------------------- */

  /**
   * Register game settings and menus for managing the World Anvil integration.
   */
  static registerSettings() {

    // World Anvil Configuration Menu
    game.settings.registerMenu("world-anvil", "config", {
      name: "WA.ConfigureMenu",
      label: "WA.ConfigureLabel",
      hint: "WA.ConfigureHint",
      icon: "fas fa-user-lock",
      type: WorldAnvilConfig,
      restricted: true
    });

    // Auth User Key
    game.settings.register("world-anvil", "configuration", {
      scope: "world",
      config: false,
      default: {},
      type: Object,
      onChange: async c => {
        const anvil = game.modules.get("world-anvil").anvil;
        if ( c.authToken !== anvil.authToken ) await anvil.connect(c.authToken);

        if ( c.otherUserId !== anvil.otherUser?.id ) {
          await anvil.getOtherUser(c.otherUserId);
        } else if ( !anvil.showOtherUserError && c.worldId !== anvil.worldId ) {
          //Only fetch world if Other User ID hasn't changed
          await anvil.getWorld(c.worldId);
        }
        const app = Object.values(ui.windows).find(a => a.constructor === WorldAnvilConfig);

        if(anvil.authToken && anvil.world) {
          app.close();
        } else {
          if ( app ) app.render();
        }
      }
    });

    game.settings.register("world-anvil", "publicArticleLinks", {
      name: "WA.PublicArticleLinksLabel",
      hint: "WA.PublicArticleLinksHint",
      scope: "world",
      type: Boolean,
      default: false,
      config: true
    });

    // Add the customizable labels for each importable page
    //-------------------
    game.settings.register("world-anvil", "mainArticlePage", {
      name: "WA.JournalPages.ArticleLabel",
      hint: "WA.JournalPages.ArticleHint",
      scope: "world",
      type: String,
      default: "",
      config: true
    });

    game.settings.register("world-anvil", "secretsPage", {
      name: "WA.JournalPages.SecretsLabel",
      hint: "WA.JournalPages.SecretsHint",
      scope: "world",
      type: String,
      default: "",
      config: true
    });

    game.settings.register("world-anvil", "sideContentPage", {
      name: "WA.JournalPages.SideContentLabel",
      hint: "WA.JournalPages.SideContentHint",
      scope: "world",
      type: String,
      default: "",
      config: true
    });

    game.settings.register("world-anvil", "portraitPage", {
      name: "WA.JournalPages.PortraitLabel",
      hint: "WA.JournalPages.PortraitHint",
      scope: "world",
      type: String,
      default: "",
      config: true
    });

    game.settings.register("world-anvil", "coverPage", {
      name: "WA.JournalPages.CoverLabel",
      hint: "WA.JournalPages.CoverHint",
      scope: "world",
      type: String,
      default: "",
      config: true
    });

    game.settings.register("world-anvil", "relationshipsPage", {
      name: "WA.JournalPages.RelationshipsLabel",
      hint: "WA.JournalPages.RelationshipsHint",
      scope: "world",
      type: String,
      default: "",
      config: true
    });

  }
}