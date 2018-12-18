/* eslint-disable import/first, import/order */

import Backbone from 'backbone';

import router from 'girder/router';
import events from 'girder/events';
import { getCurrentUser } from 'girder/auth';
import { Layout } from 'girder/constants';

// Import views from plugin
import reviewView from './pages/review/review';
import manageQuestionView from './pages/manage/manage';

// Display page for a user to perform reviews
router.route('plugins/review/:id/:type', 'FeedBackView', function (id,type) {
  events.trigger('g:navigateTo', reviewView, {id:id, type:type}, {layout: Layout.EMPTY});
});

router.route('plugins/review/admin/questions', 'FeedBackView', function () {
  events.trigger('g:navigateTo', manageQuestionView, {}, {layout: Layout.EMPTY});
});
