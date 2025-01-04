import { defineStore } from 'pinia'
import axios from 'axios'

export const useAnalysisStore = defineStore('analysis', {
  state: () => ({
    currentAnalysis: null,
    analysisHistory: [],
    loading: false,
    error: null
  }),
  
  actions: {
    async uploadAndAnalyze(formData) {
      this.loading = true
      try {
        const response = await axios.post('/api/logs/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        this.currentAnalysis = response.data
        return response.data
      } catch (error) {
        this.error = error.response?.data?.error || error.message
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async getAnalysisHistory() {
      this.loading = true
      try {
        const response = await axios.get('/api/analysis/history')
        this.analysisHistory = response.data
        return response.data
      } catch (error) {
        this.error = error.response?.data?.error || error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteAnalysis(id) {
      this.loading = true
      try {
        await axios.delete(`/api/analysis/${id}`)
        this.analysisHistory = this.analysisHistory.filter(item => item.id !== id)
      } catch (error) {
        this.error = error.response?.data?.error || error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async getServerList() {
      try {
        const response = await axios.get('/api/logs/servers')
        return response.data
      } catch (error) {
        this.error = error.response?.data?.error || error.message
        throw error
      }
    },

    async getStatistics(params) {
      this.loading = true
      try {
        const response = await axios.get('/api/analysis/history', { params })
        const data = response.data[0] || null
        
        // 如果没有数据，返回默认结构
        if (!data) {
          return {
            totalRequests: 0,
            uniqueIps: 0,
            suspiciousRequests: 0,
            logDate: null,
            details: {
              trends: [],
              statusCodeDist: {
                total: 0,
                details: [],
                categories: {}
              },
              suspiciousRequests: [],
              topIps: [],
              topPaths: [],
              topUserAgents: []
            }
          }
        }

        // 解析 JSON 字符串（如果需要）
        const details = typeof data.analysis_data === 'string' 
          ? JSON.parse(data.analysis_data) 
          : data.analysis_data

        // 返回格式化的数据
        return {
          totalRequests: data.total_requests,
          uniqueIps: data.unique_ips,
          suspiciousRequests: data.suspicious_requests,
          logDate: data.log_date,
          details: {
            ...details,
            // 确保所有必需的字段都存在
            trends: details.trends || [],
            statusCodeDist: details.statusCodeDist || {
              total: 0,
              details: [],
              categories: {}
            },
            suspiciousRequests: details.suspiciousRequests || [],
            topIps: details.topIps || [],
            topPaths: details.topPaths || [],
            topUserAgents: details.topUserAgents || []
          }
        }
      } catch (error) {
        this.error = error.response?.data?.error || error.message
        throw error
      } finally {
        this.loading = false
      }
    }
  }
}) 