import React, { Component} from 'react';
import { PropTypes } from 'prop-types';
import MatUiCheckbox from 'material-ui/Checkbox'

const styles = {
  checkbox: {
    marginBottom: 10,
    textAlign: 'start',
    maxWidth: 150,
    margin: 'auto'
  }
};

class Checkbox extends Component {
  state = {
    checked: false,
  }


  updateCheck() {
    const { handleCheckboxChange, label } = this.props;    
    this.setState((oldState) => {
      return {
        checked: !oldState.checked,
      };
    });
    handleCheckboxChange(label);
  }

  render() {
    const { label } = this.props;

    return (
      <MatUiCheckbox
      label={label}
      checked={this.state.checked}
      onCheck={this.updateCheck.bind(this)}
      style={styles.checkbox}
    />
    );
  }
}

export default Checkbox;