import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Panel from './panel';
import IconVisible from 'react-icons/lib/fa/eye';
import IconAdd from 'react-icons/lib/ti/plus';
import IconDel from 'react-icons/lib/ti/minus';
import IconEdit from 'react-icons/lib/fa/pencil';
import IconTrash from 'react-icons/lib/fa/trash';
import FormTextInput from '../style/form-text-input';
import FormNumberInput from '../style/form-number-input';
import FormSubmitButton from '../style/form-submit-button';
import CancelButton from '../style/cancel-button';

import {
  MODE_IDLE, MODE_2D_ZOOM_IN, MODE_2D_ZOOM_OUT, MODE_2D_PAN, MODE_3D_VIEW, MODE_3D_FIRST_PERSON,
  MODE_WAITING_DRAWING_LINE, MODE_DRAWING_LINE, MODE_DRAWING_HOLE, MODE_DRAWING_ITEM, MODE_DRAGGING_LINE,
  MODE_DRAGGING_VERTEX, MODE_DRAGGING_ITEM, MODE_DRAGGING_HOLE, MODE_FITTING_IMAGE, MODE_UPLOADING_IMAGE,
  MODE_ROTATING_ITEM
} from '../../constants';

const styleEditButton = {
  cursor: 'pointer',
  marginLeft: '5px',
  border: '0px',
  background: 'none',
  color: '#fff',
  fontSize: '14px',
  outline: '0px'
};

const tableLayerStyle = {
  width: '100%',
  cursor: 'pointer',
  overflowY: 'auto',
  maxHeight: '20em',
  display: 'block',
  padding: '0 1em',
  marginLeft: '1px'
};

const iconColStyle = { width: '2em' };
const styleHoverColor = { color: '#1ca6fc' };
const styleEditButtonHover = { ...styleEditButton, ...styleHoverColor };
const styleAddLabel = { fontSize: '10px', marginLeft: '5px' };
const styleEyeVisible = { fontSize: '1.25em' };
const styleEyeHidden = { ...styleEyeVisible, color: '#a5a1a1' };
const firstTdStyle = {width: '6em'};
const buttonLayerStyle = { display:'table-cell' };
const newLayerLableStyle = { margin: '0.5em 0', fontSize : '1.3em', cursor:'pointer', textAlign:'center' };
const newLayerLableHoverStyle = { ...newLayerLableStyle, ...styleHoverColor };
const layerInputTableStyle = {width:'100%', borderSpacing: "2px 0", padding: '5px 15px'};
const inputTableButtonStyle = {width:'calc( 100% + 2px )', marginTop:'0.5em', borderSpacing:'0'};

export default class PanelLayers extends Component
{
  constructor( props )
  {
    super( props );

    this.state = {
      headHovered : false,
      layerAddUIVisible: false,
      editingLayer: null
    };
  }

  addLayer( e )
  {
    e.stopPropagation();
    if( !this.state.layerAddUIVisible )
    {
      this.context.sceneActions.addLayer( '', 0 );
      this.setState( { layerAddUIVisible : false } );
    }
    else this.setState( { layerAddUIVisible : !this.state.layerAddUIVisible } );
  }

  resetLayerMod( e )
  {
    e.stopPropagation();
    this.setState({layerAddUIVisible:false, editingLayer: null});
  }

  updateLayer( e, layerData )
  {
    e.stopPropagation();
    let { id, name, opacity, altitude, order } = layerData.toJS();
    this.context.sceneActions.setLayerProperties(id, { name, opacity, altitude, order });
    this.setState( { layerAddUIVisible : false, editingLayer : null } );
  }

  delLayer( e, layerID )
  {
    e.stopPropagation();
    this.context.sceneActions.removeLayer( layerID );
    this.setState( { layerAddUIVisible : false, editingLayer : null } );
  }

  render(){

    let { scene, mode } = this.props.state;

    if (![MODE_IDLE, MODE_2D_ZOOM_IN, MODE_2D_ZOOM_OUT, MODE_2D_PAN,
      MODE_3D_VIEW, MODE_3D_FIRST_PERSON,
      MODE_WAITING_DRAWING_LINE, MODE_DRAWING_LINE, MODE_DRAWING_HOLE, MODE_DRAWING_ITEM,
      MODE_DRAGGING_LINE, MODE_DRAGGING_VERTEX, MODE_DRAGGING_ITEM, MODE_DRAGGING_HOLE,
      MODE_ROTATING_ITEM, MODE_UPLOADING_IMAGE, MODE_FITTING_IMAGE].includes(mode)) return null;

    let isLastLayer = scene.layers.size === 1;

    return (
      <Panel name={this.context.translator.t('Layers')}>
        <table style={tableLayerStyle}>
          <thead>
            <tr>
              <th colSpan='3'></th>
              <th>{this.context.translator.t('Altitude')}</th>
              <th>{this.context.translator.t('Name')}</th>
            </tr>
          </thead>
          <tbody>
            {
              scene.layers.entrySeq().map(([layerID, layer]) => {

                let selectClick = e => this.context.sceneActions.selectLayer(layerID);
                let configureClick = e => this.setState({editingLayer: layer, layerAddUIVisible: true});

                let swapVisibility = e => {
                  e.stopPropagation();
                  this.context.sceneActions.setLayerProperties(layerID, { visible: !layer.visible });
                };

                let isCurrentLayer = layerID === scene.selectedLayer;

                return (
                  <tr key={layerID} onClick={selectClick} onDoubleClick={configureClick} style={!isCurrentLayer ? null : styleHoverColor}>
                    <td style={iconColStyle}>
                      {
                        !isCurrentLayer ?
                          <IconVisible
                            onClick={swapVisibility}
                            style={!layer.visible ? styleEyeHidden : styleEyeVisible}
                          />
                          : null
                      }
                    </td>
                    <td style={iconColStyle}>
                      <IconEdit
                        onClick={configureClick}
                        style={!isCurrentLayer ? styleEditButton : styleEditButtonHover}
                        title={this.context.translator.t('Configure layer')}
                      />
                    </td>
                    <td style={iconColStyle}>
                      {
                        !isLastLayer ?
                          <IconTrash
                            onClick={ e => { this.delLayer( e, layerID ) } }
                            style={!isCurrentLayer ? styleEditButton : styleEditButtonHover}
                            title={this.context.translator.t('Delete layer')}
                          />
                          : null
                      }
                    </td>
                    <td style={{ width: '6em', textAlign: 'center' }}>
                      [ h : {layer.altitude} ]
                  </td>
                    <td>
                      {layer.name}
                    </td>
                  </tr>
                );

              })
            }
          </tbody>
        </table>
        <p
          style={ !this.state.headHovered ? newLayerLableStyle : newLayerLableHoverStyle }
          onMouseOver={ () => this.setState( { headHovered : true } ) }
          onMouseOut={ () => this.setState( { headHovered : false } ) }
          onClick={ (e) => this.addLayer(e) }
        >
          { !this.state.layerAddUIVisible ? <IconAdd /> : <IconDel /> }
          <b style={styleAddLabel}>{this.context.translator.t('New layer')}</b>
        </p>

        {
          this.state.layerAddUIVisible && this.state.editingLayer ?
          <table style={layerInputTableStyle}>
            <tbody>
              <tr style={{marginTop:'1em'}}>
                <td style={firstTdStyle}>{this.context.translator.t("name")}:</td>
                <td>
                  <FormTextInput
                    value={this.state.editingLayer.get('name')}
                    onChange={e => this.setState({editingLayer: this.state.editingLayer.merge({name:e.target.value}) })}
                  />
                </td>
              </tr>
              <tr>
                <td style={firstTdStyle}>{this.context.translator.t("opacity")}:</td>
                <td>
                  <FormNumberInput
                    value={this.state.editingLayer.get('opacity')}
                    onChange={e => this.setState({editingLayer: this.state.editingLayer.merge({opacity:e.target.value}) })}
                  />
                </td>
              </tr>
              <tr>
                <td style={firstTdStyle}>{this.context.translator.t("altitude")}:</td>
                <td>
                  <FormNumberInput
                    value={this.state.editingLayer.get('altitude')}
                    onChange={e => this.setState({editingLayer: this.state.editingLayer.merge({altitude:e.target.value}) })}
                  />
                </td>
              </tr>
              <tr>
                <td style={firstTdStyle}>{this.context.translator.t("order")}:</td>
                <td>
                  <FormNumberInput
                    value={this.state.editingLayer.get('order')}
                    onChange={e => this.setState({editingLayer: this.state.editingLayer.merge({order:e.target.value}) })}
                  />
                </td>
              </tr>
              <tr>
                <td colSpan="2">
                  <table style={inputTableButtonStyle}>
                    <tbody>
                      <tr>
                        <td><CancelButton size="small" onClick={ e => { this.resetLayerMod(e); } }>{this.context.translator.t("Reset")}</CancelButton></td>
                        <td><FormSubmitButton size="small" onClick={ e => { this.updateLayer( e, this.state.editingLayer ); } } >{this.context.translator.t("Save")}</FormSubmitButton></td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
          : null
        }

      </Panel>
    )
  }

}

PanelLayers.propTypes = {
  state: PropTypes.object.isRequired,
};

PanelLayers.contextTypes = {
  sceneActions: PropTypes.object.isRequired,
  translator: PropTypes.object.isRequired,
};
