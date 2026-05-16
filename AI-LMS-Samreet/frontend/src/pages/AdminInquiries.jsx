import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { apiConnector } from '../services/apiconnector'
import { contactUsEndpoints } from '../services/apis'
import { toast } from 'react-hot-toast'

const AdminInquiries = () => {
  const { token } = useSelector((state) => state.auth)
  const [inquiries, setInquiries] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchInquiries = async () => {
    setLoading(true)
    try {
      const response = await apiConnector('GET', contactUsEndpoints.GET_ALL_CONTACTS_API, null, {
        Authorization: `Bearer ${token}`,
      })
      setInquiries(response.data.data)
    } catch (error) {
      console.error('Error fetching inquiries:', error)
      toast.error('Failed to fetch inquiries')
    }
    setLoading(false)
  }

  const markAsResolved = async (inquiryId) => {
    try {
      await apiConnector('PUT', `${contactUsEndpoints.UPDATE_CONTACT_STATUS_API}/${inquiryId}`, 
        { status: 'Resolved' }, 
        { Authorization: `Bearer ${token}` }
      )
      toast.success('Inquiry marked as resolved')
      fetchInquiries() // Refresh the list
    } catch (error) {
      console.error('Error updating inquiry:', error)
      toast.error('Failed to update inquiry')
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchInquiries()
  }, [])

  return (
    <div className="min-h-screen bg-richblack-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-yellow-400">Support Inquiries</h1>
        
        {loading ? (
          <div className="text-center">Loading inquiries...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full bg-richblack-800 rounded-lg overflow-hidden">
              <thead className="bg-richblack-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-richblack-300 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-richblack-300 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-richblack-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-richblack-300 uppercase tracking-wider">
                    Message
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-richblack-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-richblack-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-richblack-700">
                {inquiries.map((inquiry) => (
                  <tr key={inquiry._id} className="hover:bg-richblack-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-richblack-300">
                      {inquiry.firstname} {inquiry.lastname}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-richblack-300">
                      {inquiry.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-richblack-300">
                      {new Date(inquiry.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-richblack-300 max-w-xs truncate">
                      {inquiry.message}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        inquiry.status === 'Resolved' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {inquiry.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {inquiry.status !== 'Resolved' && (
                        <button
                          onClick={() => markAsResolved(inquiry._id)}
                          className="text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                          Mark Resolved
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminInquiries