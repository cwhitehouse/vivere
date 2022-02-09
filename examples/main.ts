// eslint-disable-next-line import/no-extraneous-dependencies
import '@hotwired/turbo';

import { Vivere } from '../src/vivere';

import Index from './includes/index';
import ExampleGroup from './includes/example-group';
import FilterTag from './includes/filter-tag';

import Accordion from './includes/examples/tabs/accordion';
import AccordionSection from './includes/examples/tabs/section';

import ComplexEditing from './includes/examples/complex/editing';
import ComplexToggle from './includes/examples/complex/toggle';
import ComplexToggleList from './includes/examples/complex/toggle-list';

import FancyCounter from './includes/examples/counters/fancy';

import ListsFilter from './includes/examples/lists/filter';
import ListsShuffle from './includes/examples/lists/shuffle';
import ListsShuffleFilter from './includes/examples/lists/shuffle-filter';

import PerformanceBasic from './includes/examples/performance/basic';

import ToDoItem from './includes/examples/to-do-list/item';
import ToDoList from './includes/examples/to-do-list/list';
import ToDoNewItem from './includes/examples/to-do-list/new-item';
import ToDoSearch from './includes/examples/to-do-list/search';

import ToggleButtonColorful from './includes/examples/toggle-button/colorful';

import InputSelect from './includes/examples/inputs/select';

Vivere.register('Index', Index);
Vivere.register('ExampleGroup', ExampleGroup);
Vivere.register('FilterTag', FilterTag);

Vivere.register('Accordion', Accordion);
Vivere.register('AccordionSection', AccordionSection);

Vivere.register('ComplexEditing', ComplexEditing);
Vivere.register('ComplexToggle', ComplexToggle);
Vivere.register('ComplexToggleList', ComplexToggleList);

Vivere.register('FancyCounter', FancyCounter);

Vivere.register('ListsFilter', ListsFilter);
Vivere.register('ListsShuffle', ListsShuffle);
Vivere.register('ListsShuffleFilter', ListsShuffleFilter);

Vivere.register('PerformanceBasic', PerformanceBasic);

Vivere.register('ToDoItem', ToDoItem);
Vivere.register('ToDoList', ToDoList);
Vivere.register('ToDoNewItem', ToDoNewItem);
Vivere.register('ToDoSearch', ToDoSearch);

Vivere.register('ToggleButtonColorful', ToggleButtonColorful);

Vivere.register('InputSelect', InputSelect);
