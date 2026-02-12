import React from 'react';

// Material UI imports
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';

const VersionSelector = props => {
  return(
      <div>
        <div>
          <FormControlLabel
              control={
                <Switch
                    checked={props.model.tiny}
                    onChange={props.onChange.tiny}/>
              }
              label="tiny"/>
        </div>
        <FormControl>
          <Select
              native
              value={props.model.version}
              onChange={props.onChange.version}>
            {
              props.versions.map(function(version) {
                return <option value={version} key={version}>{version}</option>
              })
            }
          </Select>
        </FormControl>
      </div>
  )
};

export default VersionSelector;