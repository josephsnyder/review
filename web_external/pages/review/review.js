import View from 'girder/views/View';
import { restRequest } from 'girder/rest';

import MenuBarView from '../../../../tech_journal/girder-tech-journal-gui/src/views/menuBar.js';
import PeerReviewTemplate from './review_peer.pug';
import FinalReviewTemplate from './review_final.pug';
import QuestionTemplate from './review_questionEntry.pug';

var reviewView = View.extend({

    events: {
        'click .topicEntry': function(event) {
            event.preventDefault()
            var topics = this.reviewData.questions.topics
            var questionList= [];
            Object.keys(this.reviewData.questions.topics).forEach(function(val,index) {
               if(topics[val].name === event.currentTarget.text) {
                 questionList = topics[val].questions
               }

            },this);
            this.$('#templateQuestions').empty()
            this.$('#templateQuestions').append(
                QuestionTemplate({'questionList': questionList, "type":this.type})
            );
        },
        'change #listTopics': function(event) {
            event.preventDefault()
            var topics = this.reviewData.questions.topics
            var questionList= [];
            Object.keys(this.reviewData.questions.topics).forEach(function(val,index) {
               if(topics[val].name === this.$('#listTopics option:selected').val()) {
                 questionList = topics[val].questions
               }

            },this);
            this.$('#templateQuestions').empty()
            this.$('#templateQuestions').append(
                QuestionTemplate({'questionList': questionList, "type":this.type})
            );
        }
    },
    initialize: function (options) {
        var template;
        this.type = options['type']
        restRequest({
            type: 'GET',
            url: `journal/${options['id']}/details`
        }).done((totalDetails) => {
            console.log(totalDetails);
            var templateData = {
                "name":totalDetails[1]['name'],
                "description":totalDetails[1]['description']
            }
            if (this.type == 'peer') {
                this.reviewData = totalDetails[0].meta.reviews['Peer']
                templateData["review"] = this._processPeerReview(this.reviewData)
                template=PeerReviewTemplate(templateData);
            } else {
                this.reviewData = totalDetails[0].meta.reviews['Final']
                templateData["review"] = this._processFinalReview(this.reviewData)
                template=FinalReviewTemplate(templateData);
            }
            this.render(template);
        }); // End getting of parentData
    },
    render: function (templateHTML) {
        this.$el.html(templateHTML);
        new MenuBarView({ // eslint-disable-line no-new
            el: this.$el,
            parentView: this,
            searchBoxVal: '',
            appCount: 0
        });
        return this;
    },
    _processPeerReview: function (review) {
        // determine what topics are "done"
        Object.keys(review.questions.topics).forEach(function(index,topic) {
            var questions = review.questions.topics[index].questions
            review.questions.topics[index]['done'] = true;
            Object.keys(questions).forEach(function(index, question) {
                if(questions[index].value == []) {
                    review.questions.topics[index]['done'] = false;
                }
            })
        })
        return review
    },
    _processFinalReview: function (review) {
        // determine what topics are "done"
        Object.keys(review.questions.topics).forEach(function(index,topic) {
            var questions = review.questions.topics[index].questions
            review.questions.topics[index]['done'] = "";
            Object.keys(questions).forEach(function(qIndex, question) {
                if(questions[qIndex].value != []) {
                    review.questions.topics[index]['done'] = questions[qIndex].value;
                }
            })
        })
        return review
    }
});

export default reviewView;
