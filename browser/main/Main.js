import React, { PropTypes } from 'react'
import CSSModules from 'browser/lib/CSSModules'
import styles from './Main.styl'
import { connect } from 'react-redux'
import SideNav from './SideNav'
import TopBar from './TopBar'
import NoteList from './NoteList'
import Detail from './Detail'
import Repository from 'browser/lib/Repository'
import StatusBar from './StatusBar'
import _ from 'lodash'
import ConfigManager from 'browser/main/lib/ConfigManager'

class Main extends React.Component {
  constructor (props) {
    super(props)

    let { config } = props

    this.state = {
      isSliderFocused: false,
      listWidth: config.listWidth
    }
  }
  componentDidMount () {
    let { dispatch } = this.props

    // Reload all data
    Repository.loadAll()
      .then((allData) => {
        dispatch({type: 'INIT_ALL', data: allData})
      })
  }

  handleSlideMouseDown (e) {
    e.preventDefault()
    this.setState({
      isSliderFocused: true
    })
  }

  handleMouseUp (e) {
    if (this.state.isSliderFocused) {
      this.setState({
        isSliderFocused: false
      }, () => {
        let { dispatch } = this.props
        let newListWidth = this.state.listWidth
        // TODO: ConfigManager should dispatch itself.
        ConfigManager.set({listWidth: newListWidth})
        dispatch({
          type: 'SET_LIST_WIDTH',
          listWidth: newListWidth
        })
      })
    }
  }

  handleMouseMove (e) {
    if (this.state.isSliderFocused) {
      let offset = this.refs.body.getBoundingClientRect().left
      let newListWidth = e.pageX - offset
      if (newListWidth < 10) {
        newListWidth = 10
      } else if (newListWidth > 600) {
        newListWidth = 600
      }
      this.setState({
        listWidth: newListWidth
      })
    }
  }

  render () {
    let { config } = this.props

    return (
      <div
        className='Main'
        styleName='root'
        onMouseMove={(e) => this.handleMouseMove(e)}
        onMouseUp={(e) => this.handleMouseUp(e)}
      >
        <SideNav
          {..._.pick(this.props, ['dispatch', 'repositories', 'config', 'location'])}
        />
        <TopBar
          {..._.pick(this.props, [
            'dispatch',
            'repositories',
            'config',
            'params'
          ])}
        />
        <div styleName={config.isSideNavFolded ? 'body--expanded' : 'body'}
          ref='body'
        >
          <NoteList style={{width: this.state.listWidth}}
            {..._.pick(this.props, [
              'dispatch',
              'repositories',
              'config',
              'params',
              'location'
            ])}
          />
          <div styleName={this.state.isSliderFocused ? 'slider--active' : 'slider'}
            style={{left: this.state.listWidth}}
            onMouseDown={(e) => this.handleSlideMouseDown(e)}
            draggable='false'
          >
            <div styleName='slider-hitbox'/>
          </div>
          <Detail
            style={{left: this.state.listWidth + 1}}
            {..._.pick(this.props, [
              'dispatch',
              'repositories',
              'config',
              'params',
              'location'
            ])}
            ignorePreviewPointerEvents={this.state.isSliderFocused}
          />
        </div>
        <StatusBar
          {..._.pick(this.props, ['config', 'location', 'dispatch'])}
        />
      </div>
    )
  }
}

Main.propTypes = {
  dispatch: PropTypes.func,
  repositories: PropTypes.array
}

export default connect((x) => x)(CSSModules(Main, styles))
