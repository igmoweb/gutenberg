/**
 * Internal dependencies
 */
import BaseUnitControl from '../unit-control';
import { UnitControlWrapper } from './styles/box-control-styles';

export default function BoxUnitControl( { label, style, value, ...props } ) {
	const styles = {
		position: 'absolute',
		zIndex: 1,
		maxWidth: 70,
		...style,
	};

	return (
		<UnitControlWrapper aria-label={ label }>
			<BaseUnitControl
				className="component-box-control__unit-control"
				hideLabelFromVision
				hideHTMLArrows
				label={ label }
				isResetValueOnUnitChange={ false }
				placeholder={ 0 }
				style={ styles }
				value={ value }
				{ ...props }
			/>
		</UnitControlWrapper>
	);
}
