import * as React from 'react';
import * as renderer from 'react-test-renderer';
import Analytics from '../analytics';
import {runImmediate} from '../testUtils';
import {ShisellContext} from '../shisell-context';
import {enrichAnalytics} from './enrich-analytics';

class AnalyticsSender extends React.Component {
    static contextType = ShisellContext;

    render() {
        this.context.dispatcher.dispatch('TestAnalytic');
        return null;
    }
}

const identity = <T extends object>(f: T) => f;

describe('enrichAnalytics', () => {
    const writer = jest.fn();

    beforeAll(() => {
        Analytics.setWriter(writer);
    });

    it('Applies transformation to dispatchers below in context', async () => {
        const EnhancedComponent = enrichAnalytics(dispatcher => dispatcher.createScoped('Rawr'))(AnalyticsSender);

        const result = renderer.create(<EnhancedComponent />);

        await runImmediate();

        expect(writer).toHaveBeenCalledTimes(1);
        expect(writer.mock.calls[0][0]).toMatchObject({
            Name: 'TestAnalytic',
            Scope: 'Rawr',
        });
    });
});
