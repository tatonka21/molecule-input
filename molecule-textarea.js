/** @jsx hJSX */

import {Rx} from '@cycle/core';
import {hJSX} from '@cycle/dom'; // eslint-disable-line
import combineClassNames from 'util-combine-class-names';
import moleculeInputContainer from './molecule-input-container.js';
import atomAutogrowTextarea from 'atom-autogrow-textarea';

const DIALOGUE_NAME = `molecule-Textarea`;

function intent(DOM, optNamespace) {
  const namespace = optNamespace ? `.${optNamespace}` : ``;

  const selector = `TEXTAREA${namespace}`;

  return {
    isFocused$: Rx.Observable.merge(
      DOM.select(selector).events(`focus`).map(() => true),
      DOM.select(selector).events(`blur`).map(() => false)
    ).startWith(false),
    value$: DOM.select(selector).events(`input`)
      .map(e => e.target.value)
      .startWith(``),
  };
}

function model(actions) {
  const {isFocused$, value$} = actions;

  return Rx.Observable.combineLatest(
    isFocused$,
    value$,
    (isFocused, value) => ({isFocused, value})
  );
}

function view({DOM, state$, props$, namespace}) {
  const label$ = props$.map(
    (props) => {
      const {label} = props;

      return (// eslint-disable-line
        <label
          className={combineClassNames(namespace, `${DIALOGUE_NAME}_label`)}
          hidden={!label}>
          {label}
        </label>
      );
    }
  );

  const textarea$ = props$.map(
    (props) => {
      return atomAutogrowTextarea(
        {DOM, props$: Rx.Observable.just(props)}, namespace);
    }
  );

  const inputContainer$ = props$.combineLatest(
    state$,
    textarea$,
    (props, state, textarea) => {
      const {isNoFloatingLabel, isDisabled} = props;
      const {isFocused, value} = state;

      const spec = {
        DOM,
        label$,
        input$: textarea.DOM,
        props$: Rx.Observable.just({
          isNoFloatingLabel,
          isDisabled,
          isFocused,
          inputValue: value,
        }),
      };

      return moleculeInputContainer(
        spec,
        namespace
      );
    }
  );

  return inputContainer$
    .map(inputContainer => inputContainer.DOM)
    .map(
      (inputContainerVTree) => {
        return (// eslint-disable-line
          <div
            className={combineClassNames(namespace, DIALOGUE_NAME)}>
            {inputContainerVTree}
          </div>
        );
      }
  );
}

function moleculeTextArea({DOM, props$}, optNamespace = ``) {
  const namespace = optNamespace.trim();

  const actions = intent(DOM, namespace);
  const state$ = model(actions);

  return {
    DOM: view({DOM, state$, props$, namespace}),
  };
}

export default moleculeTextArea;