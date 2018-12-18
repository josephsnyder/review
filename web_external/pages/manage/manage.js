import View from 'girder/views/View';
import { restRequest } from 'girder/rest';
import events from 'girder/events';

import MenuBarView from '../../../../tech_journal/girder-tech-journal-gui/src/views/menuBar.js';
import manageReviewQuestions from './review_manageLists.pug';
import manageReviewQuestionEntry from './review_manageQuestionEntry.pug';
import addQuestionTemplate from './review_newQuestionTemplate.pug';
import addTopicTemplate from './review_newTopicTemplate.pug';
import addQListTemplate from './review_newQuestionListTemplate.pug';

var manageQuestionView = View.extend({

    events: {
        'change #selectList': function(event) {
            this.qListName = this.$('.qListOption:selected').val()
            restRequest({
                type: 'GET',
                url: `journal_review/questions?qType=${this.qListName}`
            }).done((resp) => {
                this.questionList = resp[this.$('.qListOption:selected').val()].value;
                if (!this.questionList) {
                  this.questionList = {}
                }
                this.render(manageReviewQuestions({'qList': this.qListName, 'topics': this.topicsList,'qTopics': this.questionList.questions.topics}));
                this.$(qListDetail).show();
            });
        },
        'click .topicElement': function(event) {
            event.preventDefault()
            this.topicIndex = event.target.attributes['val'].value
            this.$('.topicElement.active').toggleClass('active')
            this.$('#editTopicLink').remove()
            this.$('#editTopicLink').remove()
            this.$('.mvUp').remove()
            this.$('.mvDn').remove()
            this.$(event.currentTarget).toggleClass('active')
            this.$(event.currentTarget).append('<br><a class="mvUp">Move Up</a><a class="mvDn">Move Down</a><a id="editTopicLink">Edit Topic Details</a>')
            this.$('#questionTD').empty()
            var questions = {}
            if (Object.keys(this.questionList.questions.topics).indexOf(this.topicIndex) != -1) {
                questions = this.questionList.questions.topics[this.topicIndex].questions
            }
            this.$('#questionTD').append(
                manageReviewQuestionEntry({"questions":questions})
            );
        },
        'click #newQuestionListLink': function(event) {
            event.preventDefault()
            this.$('.questionArea').empty();
            this.$('.questionArea').append(addQListTemplate({'type': 'New', 'text':''}));
        },
        'click #newTopicLink': function(event) {
            event.preventDefault()
            this.$('.questionArea').empty();
            this.$('.questionArea').append(addTopicTemplate({'type': 'New', 'text':''}));
        },
        'click #newQuestionLink': function(event) {
            event.preventDefault()
            this.$('.questionArea').empty();
            this.$('.questionArea').append(addQuestionTemplate({'type': 'New', 'text':''}));
        },
        // Adapted from https://stackoverflow.com/questions/3050830/reorder-list-elements-jquery
        'click .mvUp': function(event) {
            event.preventDefault()
            event.stopImmediatePropagation();
            if (this.$(event.currentTarget.parentElement).not(':first-child')) {
              this.$(event.currentTarget.parentElement).prev().before(this.$(event.currentTarget.parentElement));
            }

        },
        'click .mvDn': function(event) {
            event.preventDefault()
            event.stopImmediatePropagation();
            if (this.$(event.currentTarget.parentElement).not(':last-child')) {
              this.$(event.currentTarget.parentElement).next().after(this.$(event.currentTarget.parentElement));
            }
        },
        //end taken from
        'submit #addQuestionListForm': function(event) {
            event.preventDefault()
            var valueData = {'tag': 'questionList', 'key': this.$('#listText').val(), 'value': {
                    "done": 0,
                    "questions": {
                        "list": {
                            "category_id": "",
                            "comment": "",
                            "description": this.$('#reviewDescription').val(),
                            "name": this.$('#listText').val(),
                            "type": this.$('#reviewType').val()
                        },
                        "review_id": "",
                        "revision_id": "",
                        "topics": {}
                    },
                    "type": this.$('#reviewType').val(),
                    'user': ""
                }
              };
            restRequest({
                type: 'PUT',
                url: `journal_review/questions`,
                contentType: 'application/json',
                data: JSON.stringify(valueData)
            }).done((resp) => {
                window.location.reload()
            });
        },
        'submit #addTopicForm': function(event) {
            event.preventDefault()
            this.$('#topicTD').append(`<div class="topicElement active"><a class="topicString" val=${this.$('.topicElement').length + 1}>${this.$('#topicText').val()}</a></div>`);
            this.$('#topicTD').append('<br><a class="mvUp">Move Up</a><a class="mvDn">Move Down</a><a id="editTopicLink">Edit Topic Details</a>');
            this._saveList();
        },
        'submit #addQuestionForm': function(event) {
            event.preventDefault()
            this.$('#questionTD').append(
                manageReviewQuestionEntry({questions:[{'description': this.$('#questionText').val()}]})
            );
            this._saveList();
        },
        'click #updateQuestion': function(event) {
            event.preventDefault()
            var children = this.$('#questionTD').children(".questionElement")
            var targetText = this.preEdit
            children.each(function(child) {
              if ($(children[child]).find("textarea").val() == targetText)
              {
                $(children[child]).remove()
                $('#questionTD').append(manageReviewQuestionEntry({questions:[{'description': $('#questionText').val()}]}))
              }
            }, this);
            this.$('.questionArea').empty();
        },
        'click #updateTopic': function(event) {
            event.preventDefault()
            var children = this.$('#topicTD').children(".topicElement")
            var targetText = this.preEdit
            children.each(function(child) {
              if ($(children[child]).find("a").val() == targetText)
              {
                $(children[child]).remove();
                $('#questionTD').append(manageReviewQuestionEntry({questions:[{'description': $('#questionText').val()}]}))
              }
            });
            this.$('.questionArea').empty();
        },
        'click #updateList': function(event) {
            event.preventDefault()
            var children = this.$('#questionTD').children(".questionElement")
            var targetText = this.preEdit
            children.each(function(child) {
              if ($(children[child]).find("textarea").val() == targetText)
              {
                $(children[child]).remove()
                $('#questionTD').append(manageReviewQuestionEntry({questions:[{'description': $('#questionText').val()}]}))
              }
            });
            this.$('.questionArea').empty();
        },
        'click .delQuestion': function(event) {
            event.preventDefault()
            this.$(event.currentTarget.parentElement).empty()
        },
        'click #editListLink': function(event) {
            event.preventDefault();
            event.stopImmediatePropagation();
            var listText = this.qListName
            this.preEdit = listText
            this.$('.questionArea').empty();
            this.$('.questionArea').append(addTopicTemplate({'type': 'Edit', 'text':listText}));
        },
        'click #saveListLink': function(event) {
            event.preventDefault();
            event.stopImmediatePropagation();
            this._saveList();

        },
        'click #editTopicLink': function(event) {
            event.preventDefault();
            event.stopImmediatePropagation();
            var topicText = this.$(event.currentTarget.parentElement).find(".topicString").text()
            this.preEdit = topicText
            this.$('.questionArea').empty();
            this.$('.questionArea').append(addTopicTemplate({'type': 'Edit', 'text':topicText}));
        },
        'click .EditQes': function(event) {
            event.preventDefault()
            event.stopImmediatePropagation();
            var questionText = this.$(event.currentTarget.parentElement).find('textarea').val()
            this.$('.questionArea').empty();
            this.preEdit = questionText
            this.$('.questionArea').append(addQuestionTemplate({'type': 'Edit', 'text':questionText}));
        }
    },
    _saveList: function() {
        var topicName = this.$('.topicElement.active .topicString').text()
        if(Object.keys(this.topicsList[this.qListName]).indexOf('value') === -1) {
          this.topicsList[this.qListName]['value'] = {}
        }
        var selectedTopics = this.topicsList[this.qListName].value.questions.topics;
        var targetIndex = "-1";
        console.log(targetIndex)
        Object.keys(selectedTopics).forEach( function(d) {
            if (selectedTopics[d].name === topicName)
                targetIndex = d
        })
        if (targetIndex == "-1") {
            console.log(selectedTopics)
            targetIndex = Object.keys(selectedTopics).length
            selectedTopics[JSON.stringify(Object.keys(selectedTopics).length)] = {
                "comment": "",
                "attachfile": "",
                "description": "",
                "questions": {},
                "name" : topicName
            }
        }
        this.topicsList[this.qListName].value.questions.topics = selectedTopics;
        var newQuestions = {}
        this.$('.questionElement textarea').each(function(index,data) {
            newQuestions[index] = {'attachfile':'0', 'attachfileValue':'', 'commentValue':'','comment':'1','description':$(data).text()};
        })
        this.topicsList[this.qListName].value.questions.topics[targetIndex].questions = newQuestions
        restRequest({
            type: 'PUT',
            contentType: 'application/json',
            url: `journal_review/questions`,
            data: JSON.stringify(this.topicsList[this.qListName])
        }).done((resp) => {
          events.trigger('g:alert', {
              icon: 'ok',
              text: 'Question List saved.',
              type: 'success',
              timeout: 4000
          });
        });
    },
    initialize: function (options) {
        restRequest({
            type: 'GET',
            url: 'journal_review/questions'
        }).done((resp) => {
            this.topicsList = resp
            this.render(manageReviewQuestions({'topics': this.topicsList,'qTopics':[]}));
        }); // End getting of OTJ Collection value setting
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
    }
});

export default manageQuestionView;
