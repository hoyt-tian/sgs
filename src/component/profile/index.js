import React from 'react'
import './index.less'

class Profile extends React.PureComponent {

  render() {
    const { player = null } = this.props
    return player && <section className="profile">
      <div>{player.name}</div>
      <div>{player.hero && player.hero.skills.map(s => {
        return s && <span>{s.name}</span>
      })}</div>
    </section>
  }
}

export default Profile
