import styled, { keyframes, css } from 'react-emotion';

import Router from 'next/router';

import * as React from 'react';
import * as Constants from '~/common/constants';
import * as Utilities from '~/common/utilities';

import { LATEST_VERSION } from '~/common/versions';

const STYLES_INPUT = css`
  display: flex;
  align-items: flex-end;

  .searchbox {
    width: auto;
  }

  .searchbox__input,
  input {
    font-family: ${Constants.fontFamilies.book};
    color: ${Constants.colors.black80};
    box-sizing: border-box;
    width: 380px;
    font-size: 14px;
    padding: 0 36px 0 32px;
    border-radius: 5px;
    height: 32px;
    outline: 0;
    border: 1px solid ${Constants.colors.border};
    box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.04);

    :focus {
      border: 1px solid ${Constants.colors.expo};
      outline: 0;
    }
  }

  .svg-icons {
    left: 240px;
  }

  @media screen and (max-width: ${Constants.breakpoints.mobile}) {
    display: none;
  }
`;

// TODO(jim): Not particularly happy with how this component chunks in while loading.
class AlgoliaSearch extends React.Component {
  componentWillReceiveProps(nextProps) {
    if (this.props.version && this.props.version !== nextProps.version) {
      this.docsearch.algoliaOptions = {
        ...this.docsearch.algoliaOptions,
        facetFilters: [
          `tags:${nextProps.version === 'latest' ? LATEST_VERSION : nextProps.version}`,
        ],
      };
    }
  }

  processUrl(url) {
    // Update URLs for new doc URLs
    var routes = url.split('/');
    routes[routes.length - 1] = routes[routes.length - 1].replace('.html', '');
    return routes.join('/');
  }

  componentDidMount() {
    const docsearch = require('docsearch.js');
    const Hotshot = require('hotshot');

    this.docsearch = docsearch({
      appId: 'S6DBW4862L',
      apiKey: 'f469a45764b6fd7b279f2bff604127ac',
      indexName: 'exponent-docs-v3',
      inputSelector: '#algolia-search-box',
      algoliaOptions: {
        facetFilters: [
          `tags:${this.props.version === 'latest' ? LATEST_VERSION : this.props.version}`,
        ],
        hitsPerPage: 10,
      },
      enhancedSearchInput: true,
      handleSelected: (input, event, suggestion) => {
        input.setVal('');
        const url = suggestion.url;
        let route = url.match(/https?:\/\/(.*)(\/versions\/.*)/)[2];

        let asPath = null;
        if (this.props.version === 'latest') {
          asPath = this.processUrl(Utilities.replaceVersionInUrl(route, 'latest'));
        }
        route = this.processUrl(route);
        if (asPath) {
          Router.push(route, asPath);
        } else {
          Router.push(route);
        }

        document.getElementById('docsearch').blur();
        const searchbox = document.querySelector('input#docsearch');
        const reset = document.querySelector('.searchbox [type="reset"]');
        reset.className = 'searchbox__reset';
        if (searchbox.value.length === 0) {
          reset.className += ' hide';
        }
        this.props.closeSidebar && this.props.closeSidebar();
      },
    });

    // add keyboard shortcut
    this.hotshot = new Hotshot({
      combos: [
        {
          keyCodes: [16, 191], // shift + / (otherwise known as '?')
          callback: () => setTimeout(() => document.getElementById('docsearch').focus(), 16),
        },
      ],
    });
  }

  render() {
    return (
      <div className={STYLES_INPUT} style={this.props.style}>
        <input
          id="algolia-search-box"
          type="text"
          placeholder="Search the docs"
          autoComplete="off"
          spellCheck="false"
          dir="auto"
        />
      </div>
    );
  }
}

export default AlgoliaSearch;