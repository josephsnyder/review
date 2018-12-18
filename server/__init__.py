#!/usr/bin/env python
# -*- coding: utf-8 -*-

###############################################################################
#  Copyright 2018 Open Source Electronic Health Record Alliance.
#
#  Licensed under the Apache License, Version 2.0 ( the 'License' );
#  you may not use this file except in compliance with the License.
#  You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
#  Unless required by applicable law or agreed to in writing, software
#  distributed under the License is distributed on an 'AS IS' BASIS,
#  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#  See the License for the specific language governing permissions and
#  limitations under the License.
###############################################################################
import os
import six
import json
import datetime
import re
import urllib
from bson.objectid import ObjectId

from girder.api.describe import Description, describeRoute
from girder.api.rest import Resource, RestException, filtermodel, loadmodel
from girder.api import access
from girder.constants import AccessType, TokenScope
from girder.models.model_base import ValidationException
from girder.models.folder import Folder
from girder.models.user import User
from girder.utility.model_importer import ModelImporter
from girder.utility.plugin_utilities import getPluginDir, registerPluginWebroot
from girder.utility.webroot import WebrootBase


class Webroot(WebrootBase):
    """
    The webroot endpoint simply serves the main index HTML file.
    """
    def __init__(self, templatePath=None):
        if not templatePath:
            templatePath = os.path.join(getPluginDir(), 'review', 'server', 'webroot.mako')
        super(Webroot, self).__init__(templatePath)

        self.vars = {
            'apiRoot': '/api/v1',
            'staticRoot': '/static',
            'title': 'Technical Journal Review'
        }


class TechJournalReview(Resource):
    def __init__(self):
        super(TechJournalReview, self).__init__()
        self.resourceName = 'journal_review'
        self.route('GET', ('questions',), self.getQuestions)
        self.route('PUT', ('questions',), self.setQuestions)

    @access.public(scope=TokenScope.DATA_READ)
    @describeRoute(
        Description('get the total amount of review questions')
        .param('qType', 'Name of review list to acquire', required=False)
        .errorResponse('Read access was denied on the issue.', 403)
        )
    def getQuestions(self, params):
        qLists = ModelImporter.model('journal', 'tech_journal').getAllByTag('questionList')
        if 'qType' in params:
          qLists = {k:v for (k,v) in qLists.iteritems() if k == params['qType']}
        return qLists

    @access.public(scope=TokenScope.DATA_READ)
    @describeRoute(
        Description('create/update a set of review questions')
        .param('body', 'A JSON object containing the QuestionList object to update',
               paramType='body')
        .errorResponse('Test error.')
        .errorResponse('Read access was denied on the issue.', 403)
    )
    def setQuestions(self, params):
        questionJSON = self.getBodyJson()
        ModelImporter.model('journal', 'tech_journal').set(key=questionJSON['key'],
                                                           value=questionJSON['value'], tag='questionList')

def load(info):
    techJournalReview = TechJournalReview()
    info['apiRoot'].journal_review = techJournalReview
    Folder().exposeFields(level=AccessType.READ, fields='certified')
