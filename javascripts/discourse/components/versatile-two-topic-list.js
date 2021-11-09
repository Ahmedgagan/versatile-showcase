import Component from "@ember/component";
import Category from "discourse/models/category";
import discourseComputed, { observes } from "discourse-common/utils/decorators";
import { inject as service } from "@ember/service";
import { defaultHomepage } from "discourse/lib/utilities";
import { and } from "@ember/object/computed";

const DEFAULT_FILTERS = ["latest", "new", "top", "unread"];

export default Component.extend({
  router: service(),
  tagName: "",

  didInsertElement() {
    this._super(...arguments);
    this._updateBodyClasses();
  },
  willDestroyElement() {
    this._super(...arguments);
    this._updateBodyClasses();
  },

  @observes("shouldShow")
  _updateBodyClasses() {
    const shouldCleanup = this.isDestroying || this.isDestroyed;
    if (!shouldCleanup && this.shouldShow && settings.show_as_sidebar) {
      document.body.classList.add("versatile-showcase-categories-sidebar");
    } else {
      document.body.classList.remove("versatile-showcase-categories-sidebar");
    }
  },

  get categoriesLoaded() {
    return Category.list().length !== 0;
  },

  get list() {
    if (settings.feed_list <= 0) return [];

    const list_data = settings.feed_list.split("|").map((item, index) => {
      const classes = ["col", `col-${index}`];
      const length = settings.feed_list.split("|").length;

      if (length % 2 != 0 && index === length - 1) {
        classes.push("last");
      }

      const data = item.split(",");

      const filter = DEFAULT_FILTERS.includes(data[2].trim().toLowerCase())
        ? data[2].trim().toLowerCase()
        : DEFAULT_FILTERS[0];

      return {
        title: data[0].trim(),
        length: parseInt(data[1].trim(), 10),
        filter: filter,
        tag: data[3].trim(),
        category:
          data[4] && data[4] !== "all"
            ? Category.findById(data[4].trim())
            : null,
        link: data[5].trim(),
        classes: classes.join(" "),
      };
    });

    return list_data;
  },

  @discourseComputed("router.currentRouteName")
  shouldShow(currentRouteName) {
    return currentRouteName === `discovery.${defaultHomepage()}`;
  },

  showTopicLists: and("shouldShow", "list.length"),
});
