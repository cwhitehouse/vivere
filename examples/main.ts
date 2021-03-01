// eslint-disable-next-line
import * as Turbo from '@hotwired/turbo';

import { Vivere } from '../src/vivere';

import Accordion from './includes/examples/tabs/accordion';
import AccordionSection from './includes/examples/tabs/section';

import Index from './includes/index';
import ExampleGroup from './includes/example-group';
import FilterTag from './includes/filter-tag';

import FancyCounter from './includes/examples/counters/fancy';

import ToDoItem from './includes/examples/to-do-list/item';
import ToDoList from './includes/examples/to-do-list/list';
import ToDoNewItem from './includes/examples/to-do-list/new-item';
import ToDoSearch from './includes/examples/to-do-list/search';

Vivere.register('Accordion', Accordion);
Vivere.register('AccordionSection', AccordionSection);
Vivere.register('Index', Index);
Vivere.register('ExampleGroup', ExampleGroup);
Vivere.register('FilterTag', FilterTag);
Vivere.register('FancyCounter', FancyCounter);
Vivere.register('ToDoItem', ToDoItem);
Vivere.register('ToDoList', ToDoList);
Vivere.register('ToDoNewItem', ToDoNewItem);
Vivere.register('ToDoSearch', ToDoSearch);
