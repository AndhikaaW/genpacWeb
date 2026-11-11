import { GraduationCap } from 'lucide-react'

export default function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <GraduationCap size={48} className="loading-icon" />
        <h2>Genza Education</h2>
        <div className="loading-spinner" />
      </div>
    </div>
  )
}
