type PremiumFeatureProps = {
  featureName: string
  isEnabled?: boolean
}

const PremiumFeature = ({
  featureName,
  isEnabled = false,
}: PremiumFeatureProps) => {
  return (
    <div className="flex items-center">
      <div className={`w-5 h-5 rounded-full mr-3 ${isEnabled ? 'bg-green-500' : 'bg-gray-600'}`}></div>
      <span className="text-sm">{featureName}</span>
    </div>
  )
}

export default PremiumFeature
